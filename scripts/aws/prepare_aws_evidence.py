
import json
from pathlib import Path

BUCKET = "roadguard-ai-mumbai-2026-123"
RUN_ID = "roadguard-run-001"

source = Path("output/agent_global/inspection_trace.json")
destination = Path("output/aws_ready/inspection_trace.json")

report = json.loads(source.read_text(encoding="utf-8"))

images = set()

for event in report["events"]:
    for kind in ("original", "annotated"):
        local_image = Path(event["evidence"][kind])

        if not local_image.is_file():
            raise FileNotFoundError(local_image)

        images.add(local_image.name)

        s3_key = (
            f"incoming/{RUN_ID}/evidence/{local_image.name}"
        )

        event["evidence"][kind] = f"s3://{BUCKET}/{s3_key}"

destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_text(
    json.dumps(report, indent=2),
    encoding="utf-8",
)

print("Events:", len(report["events"]))
print("Referenced images:", len(images))
print("Prepared:", destination)
