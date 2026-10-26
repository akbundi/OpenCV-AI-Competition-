from pathlib import Path
import cv2

MODEL_PATH = Path("models/roadguard_yolov8n.onnx")
IMAGE_DIR = Path("data/roadguard/images/val")

print("OpenCV version:", cv2.__version__)

assert cv2.__version__.startswith("5."), "OpenCV 5 is required"
assert MODEL_PATH.exists(), "ONNX model not found"

# Load ONNX using OpenCV
net = cv2.dnn.readNetFromONNX(str(MODEL_PATH))

print("ONNX model loaded successfully")

# Select one image
image_path = next(IMAGE_DIR.glob("*.jpg"))

image = cv2.imread(str(image_path))

if image is None:
    raise RuntimeError("Could not load test image")

# Create network input
blob = cv2.dnn.blobFromImage(
    image,
    scalefactor=1 / 255.0,
    size=(640, 640),
    swapRB=True,
    crop=False
)

net.setInput(blob)

# Run OpenCV DNN inference
output = net.forward()

print("Input blob shape:", blob.shape)
print("Output shape:", output.shape)