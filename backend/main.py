"""RoadGuard public demo API. Inference runs on the AWS EC2 host (NOT in Lambda).

Uses the EXISTING project's roadguard_agent.py and opencv_detector.py unchanged.
Upload -> local CPU inference -> S3 evidence first, trace last -> existing S3 Lambda.
Run with a *single* Uvicorn worker. Demo access code protects all non-health APIs.
"""
from __future__ import annotations

import hmac
import json
import os
import re
import shutil
import subprocess
import sys
import threading
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import boto3
from botocore.exceptions import ClientError
from fastapi import FastAPI, File, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, Field
from starlette.requests import Request
from starlette.staticfiles import StaticFiles

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"
DATA = ROOT / "runtime"
DATA.mkdir(parents=True, exist_ok=True)
BUCKET = os.getenv("ROADGUARD_BUCKET", "roadguard-ai-mumbai-2026-123").strip()
REGION = os.getenv("AWS_REGION", "ap-south-1")
DEMO_CODE = os.getenv("ROADGUARD_DEMO_CODE", "").strip()
MAX_UPLOAD_MB = int(os.getenv("ROADGUARD_MAX_UPLOAD_MB", "80"))
MAX_VIDEO_BYTES = MAX_UPLOAD_MB * 1024 * 1024
MAX_FRAMES = int(os.getenv("ROADGUARD_MAX_FRAMES", "300"))
STRIDE = int(os.getenv("ROADGUARD_STRIDE", "5"))
MAX_ACTIVE = 1
RUN_RE = re.compile(r"^[A-Za-z0-9_-]{1,80}$")
DECISIONS = {"confirmed", "rejected", "needs_more_evidence"}
s3 = boto3.client("s3", region_name=REGION)
app = FastAPI(title="RoadGuard AWS Inspector", docs_url=None, redoc_url=None, openapi_url=None)
workers = ThreadPoolExecutor(max_workers=1, thread_name_prefix="roadguard-ai")
lock = threading.RLock()
jobs: dict[str, dict] = {}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def check_auth(x_roadguard_code: str | None) -> None:
    if not DEMO_CODE:
        raise HTTPException(status_code=503, detail="Demo access code is not configured on server")
    if not x_roadguard_code or not hmac.compare_digest(x_roadguard_code, DEMO_CODE):
        raise HTTPException(status_code=401, detail="Invalid demo access code")


def require_run(run_id: str) -> str:
    if not RUN_RE.fullmatch(run_id):
        raise HTTPException(status_code=400, detail="Invalid run identifier")
    return run_id


def safe_upload_file(filename: str) -> bool:
    return Path(filename).suffix.lower() in {".mp4", ".mov", ".avi", ".mkv"}


def s3_json(key: str) -> dict | None:
    try:
        data = s3.get_object(Bucket=BUCKET, Key=key)["Body"].read()
        return json.loads(data)
    except ClientError as exc:
        if exc.response.get("Error", {}).get("Code") in {"NoSuchKey", "404", "NotFound"}:
            return None
        raise


def run_info(run_id: str) -> dict:
    with lock:
        local = dict(jobs.get(run_id) or {})
    # Dynamically retrieve Lambda's real, asynchronous output from S3.
    summary = s3_json(f"reports/{run_id}/review_summary.json")
    decisions = s3_json(f"reviews/{run_id}/decisions.json") or {"decisions": {}, "history": []}
    if not local and not summary:
        raise HTTPException(status_code=404, detail="Run not found")
    stage = local.get("stage") or "cloud_report_ready"
    return {
        "run_id": run_id,
        "stage": stage,
        "error": local.get("error"),
        "created_at": local.get("created_at"),
        "cloud_report_ready": summary is not None,
        "summary": summary,
        "decisions": decisions.get("decisions", {}),
        "review_history": decisions.get("history", []),
    }


def persist_local_state(run_id: str) -> None:
    with lock:
        job = dict(jobs[run_id])
    path = DATA / run_id / "state.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(job, indent=2), encoding="utf-8")


def set_state(run_id: str, stage: str, error: str | None = None) -> None:
    with lock:
        jobs[run_id]["stage"] = stage
        jobs[run_id]["error"] = error
        jobs[run_id]["updated_at"] = utc_now()
    persist_local_state(run_id)


def publish(run_id: str, video_path: Path, trace_path: Path) -> int:
    """S3 evidence/images first; inspection_trace.json LAST to trigger Lambda."""
    report = json.loads(trace_path.read_text(encoding="utf-8"))
    events = report.get("events", [])
    if not isinstance(events, list):
        raise ValueError("Agent trace is missing events list")
    prefix = f"incoming/{run_id}"
    remote_report = json.loads(json.dumps(report))
    uploaded: dict[str, Path] = {}
    for event in remote_report["events"]:
        evidence = event.get("evidence", {})
        for kind in ("original", "annotated"):
            raw = evidence.get(kind)
            if not raw or not isinstance(raw, str):
                raise ValueError(f"Missing {kind} evidence for event {event.get('event_id')}")
            path = Path(raw)
            if not path.is_absolute():
                path = ROOT / path
            path = path.resolve()
            expected_folder = trace_path.parent.resolve() / "evidence"
            if path.parent != expected_folder or not path.is_file():
                raise ValueError(f"Invalid evidence location for event {event.get('event_id')}")
            key = f"{prefix}/evidence/{path.name}"
            if key in uploaded and uploaded[key] != path:
                raise ValueError("Duplicate image filename")
            uploaded[key] = path
            evidence[kind] = f"s3://{BUCKET}/{key}"
    # Upload source video privately so an inspector can audit the original input.
    video_key = f"{prefix}/source_video{video_path.suffix.lower()}"
    s3.upload_file(str(video_path), BUCKET, video_key,
                   ExtraArgs={"ContentType": "video/mp4" if video_path.suffix.lower() == ".mp4" else "application/octet-stream"})
    for key, path in uploaded.items():
        s3.upload_file(str(path), BUCKET, key, ExtraArgs={"ContentType": "image/jpeg"})
    remote_report["source_video_s3"] = f"s3://{BUCKET}/{video_key}"
    remote_report["s3_bucket"] = BUCKET
    remote_report["s3_prefix"] = prefix
    # Last upload fires the existing S3 ObjectCreated -> Lambda report pipeline.
    s3.put_object(Bucket=BUCKET, Key=f"{prefix}/inspection_trace.json",
                  Body=json.dumps(remote_report, indent=2).encode("utf-8"),
                  ContentType="application/json")
    return len(events)


def process(run_id: str, video_path: Path) -> None:
    try:
        set_state(run_id, "running_opencv5_yolo")
        output = DATA / run_id / "agent_output"
        output.mkdir(parents=True, exist_ok=True)
        if not (ROOT / "roadguard_agent.py").exists():
            raise FileNotFoundError("roadguard_agent.py not in project root")
        proc = subprocess.run([
            sys.executable, str(ROOT / "roadguard_agent.py"),
            "--video", str(video_path), "--output", str(output),
            "--max-frames", str(MAX_FRAMES), "--stride", str(STRIDE),
        ], cwd=str(ROOT), capture_output=True, text=True, timeout=1200)
        (DATA / run_id / "agent_stdout.log").write_text(proc.stdout[-12000:], encoding="utf-8")
        if proc.returncode != 0:
            raise RuntimeError(f"Agent failed (exit {proc.returncode}): {proc.stderr[-1200:]}")
        trace_path = output / "inspection_trace.json"
        if not trace_path.exists():
            raise RuntimeError("Agent did not produce inspection_trace.json")
        set_state(run_id, "uploading_evidence_to_s3")
        count = publish(run_id, video_path, trace_path)
        with lock:
            jobs[run_id]["candidate_events"] = count
        # S3->Lambda happens asynchronously; report might not exist yet.
        set_state(run_id, "awaiting_lambda_report")
    except Exception as exc:
        # Avoid leaking filesystem paths / internal details to public clients.
        set_state(run_id, "failed", str(exc)[:300])


@app.get("/api/health")
def health():
    import cv2
    return {"service": "RoadGuard AWS inference", "region": REGION,
            "runtime": "EC2 CPU / OpenCV ONNX", "max_frames": MAX_FRAMES,
            "configured": bool(DEMO_CODE), "opencv_version": cv2.__version__,
            "agent_present": (ROOT / "roadguard_agent.py").is_file(),
            "global_model_present": (ROOT / "models" / "roadguard_global_yolov8n.onnx").is_file()}


@app.post("/api/runs", status_code=202)
async def create_run(file: UploadFile = File(...), x_roadguard_code: str | None = Header(None)):
    check_auth(x_roadguard_code)
    if not safe_upload_file(file.filename or ""):
        raise HTTPException(status_code=400, detail="Upload an MP4, MOV, AVI or MKV video")
    with lock:
        active = sum(j.get("stage") in {"upload_received", "running_opencv5_yolo", "uploading_evidence_to_s3"}
                     for j in jobs.values())
        if active >= MAX_ACTIVE:
            raise HTTPException(status_code=429, detail="RoadGuard is processing a video. Please retry shortly")
        run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ") + "-" + uuid.uuid4().hex[:7]
        jobs[run_id] = {"run_id": run_id, "stage": "upload_received", "created_at": utc_now(),
                        "filename": Path(file.filename).name[:140], "error": None}
    run_dir = DATA / run_id
    run_dir.mkdir(parents=True, exist_ok=True)
    destination = run_dir / f"upload{Path(file.filename).suffix.lower()}"
    size = 0
    try:
        with destination.open("wb") as stream:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_VIDEO_BYTES:
                    raise HTTPException(status_code=413, detail=f"Video must be at most {MAX_UPLOAD_MB} MB")
                stream.write(chunk)
        if size == 0:
            raise HTTPException(status_code=400, detail="Empty video")
        import cv2
        cap = cv2.VideoCapture(str(destination))
        valid = cap.isOpened()
        if valid:
            valid, _ = cap.read()
        cap.release()
        if not valid:
            raise HTTPException(status_code=400, detail="Could not decode video")
        persist_local_state(run_id)
        workers.submit(process, run_id, destination)
        return {"run_id": run_id, "stage": "upload_received"}
    except Exception:
        shutil.rmtree(run_dir, ignore_errors=True)
        with lock:
            jobs.pop(run_id, None)
        raise
    finally:
        await file.close()


@app.get("/api/runs/{run_id}")
def get_run(run_id: str, x_roadguard_code: str | None = Header(None)):
    check_auth(x_roadguard_code)
    require_run(run_id)
    return run_info(run_id)


@app.get("/api/runs/{run_id}/trace")
def get_trace(run_id: str, x_roadguard_code: str | None = Header(None)):
    check_auth(x_roadguard_code)
    require_run(run_id)
    path = DATA / run_id / "agent_output" / "inspection_trace.json"
    if path.is_file():
        return json.loads(path.read_text(encoding="utf-8"))
    report = s3_json(f"incoming/{run_id}/inspection_trace.json")
    if report is None:
        raise HTTPException(status_code=404, detail="Inspection trace not available yet")
    return report


@app.get("/api/runs/{run_id}/evidence/{event_id}/{kind}")
def get_image(run_id: str, event_id: int, kind: str, x_roadguard_code: str | None = Header(None)):
    check_auth(x_roadguard_code)
    require_run(run_id)
    if kind not in {"original", "annotated"} or event_id < 1:
        raise HTTPException(status_code=400, detail="Invalid evidence request")
    trace = get_trace(run_id, x_roadguard_code)
    event = next((e for e in trace.get("events", []) if e.get("event_id") == event_id), None)
    if event is None:
        raise HTTPException(status_code=404, detail="Evidence event not found")
    raw = event.get("evidence", {}).get(kind, "")
    # For stored cloud runs, read only from the dedicated run's S3 evidence prefix.
    if raw.startswith("s3://"):
        uri = urlparse(raw)
        key = uri.path.lstrip("/")
        if uri.netloc != BUCKET or not key.startswith(f"incoming/{run_id}/evidence/") or "/" in key.split("/evidence/", 1)[-1]:
            raise HTTPException(status_code=400, detail="Invalid image S3 path")
        try:
            return Response(content=s3.get_object(Bucket=BUCKET, Key=key)["Body"].read(), media_type="image/jpeg")
        except ClientError:
            raise HTTPException(status_code=404, detail="Evidence image not found")
    local_image = (ROOT / raw).resolve()
    allowed = (DATA / run_id / "agent_output" / "evidence").resolve()
    if local_image.parent != allowed or not local_image.is_file():
        raise HTTPException(status_code=404, detail="Evidence image not available")
    return FileResponse(local_image, media_type="image/jpeg")


class DecisionInput(BaseModel):
    event_id: int = Field(ge=1)
    decision: str
    note: str = Field(default="", max_length=1000)


@app.post("/api/runs/{run_id}/review")
def review(run_id: str, body: DecisionInput, x_roadguard_code: str | None = Header(None)):
    check_auth(x_roadguard_code)
    require_run(run_id)
    if body.decision not in DECISIONS:
        raise HTTPException(status_code=400, detail="Invalid review decision")
    trace = get_trace(run_id, x_roadguard_code)
    if not any(e.get("event_id") == body.event_id for e in trace.get("events", [])):
        raise HTTPException(status_code=404, detail="Event not found")
    key = f"reviews/{run_id}/decisions.json"
    with lock:  # single-worker demo; not a multi-writer transaction
        doc = s3_json(key) or {"schema_version": "1.0", "decisions": {}, "history": []}
        record = {"event_id": body.event_id, "decision": body.decision,
                  "note": body.note, "reviewer": "Demo inspector", "timestamp_utc": utc_now()}
        doc["decisions"][str(body.event_id)] = record
        doc["history"].append(record)
        s3.put_object(Bucket=BUCKET, Key=key,
                      Body=json.dumps(doc, indent=2).encode("utf-8"),
                      ContentType="application/json")
    return record


@app.get("/")
def index():
    return FileResponse(FRONTEND / "index.html", media_type="text/html")


app.mount("/static", StaticFiles(directory=str(FRONTEND)), name="static")


# After restart, preserve local run states and enable looking up pre-existing S3 runs.
for state_file in DATA.glob("*/state.json"):
    try:
        data = json.loads(state_file.read_text(encoding="utf-8"))
        if RUN_RE.fullmatch(data.get("run_id", "")):
            if data.get("stage") in {"upload_received", "running_opencv5_yolo", "uploading_evidence_to_s3"}:
                data["stage"] = "interrupted"
            jobs[data["run_id"]] = data
    except (ValueError, OSError, KeyError):
        pass
