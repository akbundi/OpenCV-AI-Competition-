# Models Directory

Place pre-trained and fine-tuned model checkpoints here.

## Recommended Models

1. **Object Detection & Vehicle Tracking:**
   - `yolov8n.pt` / `yolov8s.pt` (Baseline YOLOv8 checkpoints)
   - Fine-tuned road hazard models (potholes, debris, pedestrians, vehicle classifications)

2. **Optical Flow / Specialized Embeddings:**
   - OpenCV tracking / Farneback parameters
   - ReID (Re-Identification) models for vehicle tracking across cameras

## Download Instructions

You can download standard YOLO weights via Ultralytics:
```bash
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
```
or move your custom-trained weights (`*.pt`, `*.onnx`, `*.engine`) into this folder.
