"""Create a PRIVATE shareable ZIP containing only evidence needed by a trace.

Run at RoadGuard repository root:
    python package_roadguard_evidence.py
Share the output privately with your authorized AWS teammate; do not commit it.
"""
import argparse
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--trace", type=Path, default=Path("output/agent_global/inspection_trace.json"))
    parser.add_argument("--output", type=Path, default=Path("roadguard_evidence_private.zip"))
    args = parser.parse_args()
    project_root = Path.cwd().resolve()
    trace = args.trace.resolve()
    if not trace.is_file():
        parser.error(f"Trace not found: {trace}")
    report = json.loads(trace.read_text(encoding="utf-8"))
    events = report.get("events")
    if not isinstance(events, list):
        parser.error("Trace has no events list")

    paths = [trace]
    for event in events:
        evidence = event.get("evidence") or {}
        for kind in ("original", "annotated"):
            if kind not in evidence:
                parser.error(f"Event {event.get('event_id')} missing {kind} evidence")
            p = Path(evidence[kind]).resolve()
            if not p.is_file():
                parser.error(f"Missing evidence: {p}")
            paths.append(p)

    unique_paths = sorted(set(paths))
    for p in unique_paths:
        if not p.is_relative_to(project_root):
            parser.error(f"Refusing to package a file outside project directory: {p}")

    output = args.output.resolve()
    if output in unique_paths:
        parser.error("Output archive cannot overwrite a source file")
    with ZipFile(output, "w", compression=ZIP_DEFLATED, compresslevel=6) as z:
        for p in unique_paths:
            z.write(p, p.relative_to(project_root).as_posix())

    print(f"ZIP: {output}")
    print(f"Trace: {args.trace}")
    print(f"Evidence images: {len(unique_paths)-1}")
    print("Sensitive/private content: share only through approved private channels")


if __name__ == "__main__":
    main()
