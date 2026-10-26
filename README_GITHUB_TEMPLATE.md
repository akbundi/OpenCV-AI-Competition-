# RoadGuard — Evidence-Driven Agentic Road Inspection

RoadGuard detects road-surface damage in driving footage using a **global YOLOv8n ONNX detector and OpenCV 5**, then runs an evidence-driven agent that samples additional frames, compares motion, tentatively groups repeated detections, and routes uncertain cases for human inspection. **It does not autonomously verify road defects or approve road repairs.**

## Model and evaluation
- Sources: seven RDD2022 country/viewpoint folders; processed **25,619** images and **55,230** valid boxes.
- Classes: longitudinal crack (D00+D01), transverse crack (D10+D11), alligator crack (D20), other road damage (D40).
- Held-out multi-country test (3,833 images): **precision 0.5857**, **recall 0.4815**, **mAP50 0.5092**, **mAP50–95 0.2518**. These scores do **not** measure generalization to the UK driving video.
- Global model exported to static ONNX with output shape `(1, 8, 8400)`.

## Confirmed local agent run
- 300 video frames; initial sampling on 60 frames.
- 25 raw candidate observations → 10 tentative image-space groups.
- 44 agent-requested additional ONNX frame inferences.
- 4 candidate reviews, 2 possible camera-artifact reviews and 4 insufficient-evidence reviews.
- All candidate cases require human review; grouping and camera-artifact identification remain heuristics.

## Run locally
1. Install Python dependencies as defined by `pyproject.toml` / `uv.lock`; verify `cv2.__version__` is OpenCV **5.x** in the final local execution environment.
2. Place the exported global model at `models/roadguard_global_yolov8n.onnx` (subject to redistribution/license rights). Ensure `MODEL_PATH` in `opencv_detector.py` points to it.
3. Supply an appropriately licensed dashcam clip at `data/videos/road_sample.mp4`.
4. Run:
   ```powershell
   python video_detector.py
   python roadguard_agent.py --video data/videos/road_sample.mp4 --max-frames 300 --stride 5
   ```
5. Review `output/agent_global/inspection_trace.json` and associated `output/agent_global/evidence/` images.

## AWS integration and collaboration
See **[README_AWS.md](README_AWS.md)** for the complete deployment handoff. Cloud-side S3 and Lambda processing is separate from local OpenCV 5 execution. AWS deployment should not be claimed until the teammate has verified a successful `reports/<run-id>/review_summary.json` upload and CloudWatch logs.

**Do not commit:** raw RDD2022 images and archives, raw road video, generated private evidence, credentials, or AWS keys. Add license notices and comply with Ultralytics/model and dataset redistribution terms before making the repository public.

## Limitations and responsible use
Predictions may miss cracks or misclassify shadows/windshield reflections. Optical-flow signals do not prove road damage or an optical artifact. Image-space groups are not guaranteed unique physical defects, and boxes are not calibrated physical measurements. Human confirmation is mandatory before action.
