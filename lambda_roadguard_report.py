"""RoadGuard Lambda: build a human-review queue from agent inspection evidence.

Trigger S3 ObjectCreated:* with prefix incoming/ and suffix inspection_trace.json.
Handler: lambda_roadguard_report.lambda_handler (rename this file on deployment).
The S3 bucket and Lambda must share a region.
"""

from collections import Counter
from datetime import datetime, timezone
import json
import re
from urllib.parse import unquote_plus

STATUS_PRIORITY = {
    "candidate_for_human_review": 0,
    "possible_camera_artifact_review": 1,
    "uncertain_more_evidence_needed": 2,
}


def make_summary(trace, bucket, key):
    """Pure report construction: deterministic prioritization, no AWS dependencies."""
    events = trace.get("events")
    if not isinstance(events, list):
        raise ValueError("inspection_trace.json must contain an events list")

    queue = []
    for entry in events:
        perception = entry.get("perception") or {}
        queue.append({
            "event_id": entry.get("event_id"),
            "source_frame": entry.get("source_frame"),
            "class_name": perception.get("class_name", "UNKNOWN"),
            "confidence": perception.get("confidence"),
            "status": entry.get("status", "unknown"),
            "observations_grouped": (entry.get("association") or {}).get("observations_count", 1),
            "temporal_overlap_support": entry.get("temporal_overlap_support", 0),
            "possible_camera_fixed_signal_count": entry.get("possible_camera_fixed_signal_count", 0),
            "evidence": entry.get("evidence", {}),
            "human_review_state": "pending",
        })

    queue.sort(key=lambda item: (
        STATUS_PRIORITY.get(item["status"], 99),
        -(item["temporal_overlap_support"] or 0),
        -(item["confidence"] or 0),
    ))

    return {
        "schema_version": "1.0",
        "project": "RoadGuard",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "source_trace": f"s3://{bucket}/{key}",
        "model": trace.get("model"),
        "opencv_version": trace.get("opencv_version"),
        "frames_read": trace.get("frames_read"),
        "raw_detection_observations": trace.get("raw_detection_observations"),
        "candidate_groups": trace.get("candidate_groups"),
        "additional_vision_inferences": trace.get("additional_vision_inferences"),
        "candidate_events": len(queue),
        "status_counts": dict(Counter(item["status"] for item in queue)),
        "class_counts": dict(Counter(item["class_name"] for item in queue)),
        "review_queue": queue,
        "responsible_use": (
            "All entries are model-predicted inspection candidates, NOT verified road defects. "
            "Temporal groups are tentative image-space associations, NOT confirmed distinct defects. "
            "Camera-artifact flags are heuristic; human inspection is necessary. "
            "No calibrated defect measurements or repair-cost estimates are provided."
        ),
    }


def lambda_handler(event, context):
    import boto3  # included by AWS Lambda Python runtime for this console-based deployment

    s3 = boto3.client("s3")
    results = []
    for record in event.get("Records", []):
        if record.get("eventSource") != "aws:s3":
            continue
        bucket = record["s3"]["bucket"]["name"]
        key = unquote_plus(record["s3"]["object"]["key"])
        match = re.fullmatch(r"incoming/([A-Za-z0-9_-]{1,80})/inspection_trace\.json", key)
        if match is None:
            continue
        run_id = match.group(1)
        response = s3.get_object(Bucket=bucket, Key=key)
        trace = json.loads(response["Body"].read().decode("utf-8"))
        summary = make_summary(trace, bucket, key)
        report_key = f"reports/{run_id}/review_summary.json"
        s3.put_object(
            Bucket=bucket,
            Key=report_key,
            Body=json.dumps(summary, indent=2).encode("utf-8"),
            ContentType="application/json",
            ServerSideEncryption="AES256",
        )
        results.append({"report": f"s3://{bucket}/{report_key}", "events": len(summary["review_queue"])})
    return {"processed": len(results), "reports": results}
