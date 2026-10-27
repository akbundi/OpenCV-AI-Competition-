"""Upload a RoadGuard inspection and its evidence to a private S3 bucket.

Usage (from RoadGuard project root):
    python -m pip install boto3
    python aws_upload.py --bucket YOUR_PRIVATE_BUCKET
    python aws_upload.py --bucket YOUR_PRIVATE_BUCKET --profile roadguard

Uploads evidence first, then the JSON trace as the final object. This allows
an optional S3 ObjectCreated trigger on incoming/*/inspection_trace.json to
start cloud reporting only when all evidence is available.

Uses the standard AWS credentials chain. Never put access keys in this file.
"""

import argparse
import copy
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

import boto3
from botocore.exceptions import BotoCoreError, ClientError, NoCredentialsError

TRACE_PATH = Path("output/agent_global/inspection_trace.json")


def main():
    parser = argparse.ArgumentParser(description="Upload RoadGuard agent evidence to S3")
    parser.add_argument("--bucket", required=True, help="Existing private S3 bucket name")
    parser.add_argument("--trace", type=Path, default=TRACE_PATH)
    parser.add_argument("--profile", default=None, help="Optional configured AWS profile")
    parser.add_argument("--run-id", default=None, help="Optional unique run identifier")
    parser.add_argument("--dry-run", action="store_true", help="Show objects without uploading")
    args = parser.parse_args()

    if not args.trace.is_file():
        parser.error(f"Agent trace missing: {args.trace}. Run python roadguard_agent.py first.")
    report = json.loads(args.trace.read_text(encoding="utf-8"))
    if not isinstance(report.get("events"), list):
        parser.error("Trace has no 'events' list")

    run_id = args.run_id or (
        datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        + "-" + uuid4().hex[:6]
    )
    if not re.fullmatch(r"[A-Za-z0-9_-]{1,80}", run_id):
        parser.error("--run-id must be 1-80 letters, digits, underscores or hyphens")

    prefix = f"incoming/{run_id}"
    remote_report = copy.deepcopy(report)
    remote_report["s3_bucket"] = args.bucket
    remote_report["s3_prefix"] = prefix
    uploads = {}

    for event in remote_report["events"]:
        evidence = event.get("evidence", {})
        for kind in ("original", "annotated"):
            if kind not in evidence:
                parser.error(f"Event {event.get('event_id')} missing '{kind}' evidence")
            filepath = Path(evidence[kind])
            if not filepath.is_file():
                parser.error(f"Evidence file missing: {filepath}")
            key = f"{prefix}/evidence/{filepath.name}"
            if key in uploads and uploads[key] != filepath:
                parser.error(f"Evidence filenames collide in S3: {key}")
            uploads[key] = filepath
            evidence[kind] = f"s3://{args.bucket}/{key}"

    report_key = f"{prefix}/inspection_trace.json"
    print(f"Run ID: {run_id}")
    print(f"Evidence images: {len(uploads)}")
    print(f"Destination: s3://{args.bucket}/{prefix}/")

    if args.dry_run:
        print("DRY RUN: no uploads performed")
        return

    try:
        session = boto3.Session(profile_name=args.profile)
        client = session.client("s3")
        for number, (key, filepath) in enumerate(sorted(uploads.items()), start=1):
            client.upload_file(
                str(filepath), args.bucket, key,
                ExtraArgs={"ContentType": "image/jpeg"},
            )
            if number % 10 == 0 or number == len(uploads):
                print(f"Uploaded {number}/{len(uploads)} evidence images")

        # Publish report LAST so a Lambda S3 trigger sees completed evidence.
        client.put_object(
            Bucket=args.bucket,
            Key=report_key,
            Body=json.dumps(remote_report, indent=2).encode("utf-8"),
            ContentType="application/json",
        )
    except (BotoCoreError, ClientError, NoCredentialsError) as exc:
        print(f"AWS upload failed: {exc}")
        print("Check your AWS credentials, bucket name, and s3:PutObject permission.")
        raise SystemExit(1) from exc

    print(f"SUCCESS: s3://{args.bucket}/{report_key}")
    print("This stores the evidence; processing on AWS requires a Lambda/compute step.")


if __name__ == "__main__":
    main()
