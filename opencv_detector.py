
from pathlib import Path
import cv2
import numpy as np

MODEL_PATH = Path("models/roadguard_global_yolov8n.onnx")
IMAGE_DIR = Path("data/roadguard/images/val")
LABEL_DIR = Path("data/roadguard/labels/val")
OUTPUT_DIR = Path("output/detections")

INPUT_SIZE = 640
CONF_THRESHOLD = 0.25
NMS_THRESHOLD = 0.45

CLASS_NAMES = [
    "LONGITUDINAL_CRACK",
    "TRANSVERSE_CRACK",
    "ALLIGATOR_CRACK",
    "OTHER_ROAD_DAMAGE",
]


def preprocess(image):
    """
    Letterbox image to 640x640 while
    preserving its aspect ratio.
    """

    h, w = image.shape[:2]

    scale = min(INPUT_SIZE / w, INPUT_SIZE / h)

    new_w = round(w * scale)
    new_h = round(h * scale)

    resized = cv2.resize(image, (new_w, new_h))

    dw = INPUT_SIZE - new_w
    dh = INPUT_SIZE - new_h

    left = dw // 2
    right = dw - left
    top = dh // 2
    bottom = dh - top

    padded = cv2.copyMakeBorder(
        resized, top, bottom, left, right,
        cv2.BORDER_CONSTANT,
        value=(114, 114, 114)
    )

    blob = cv2.dnn.blobFromImage(
        padded,
        scalefactor=1 / 255.0,
        size=(INPUT_SIZE, INPUT_SIZE),
        swapRB=True,
        crop=False
    )

    return blob, scale, left, top


def postprocess(output, image_shape, scale, left, top):
    """
    Decode YOLOv8 predictions and apply
    class-wise non-maximum suppression.
    """

    image_h, image_w = image_shape[:2]

    # (1, 8, 8400) -> (8400, 8)
    predictions = output[0].T

    candidates = []

    for prediction in predictions:

        class_scores = prediction[4:]

        class_id = int(np.argmax(class_scores))
        confidence = float(class_scores[class_id])

        if confidence < CONF_THRESHOLD:
            continue

        cx, cy, bw, bh = prediction[:4]

        # Convert from letterbox coordinates
        # back to original image coordinates.
        x1 = (cx - bw / 2 - left) / scale
        y1 = (cy - bh / 2 - top) / scale
        x2 = (cx + bw / 2 - left) / scale
        y2 = (cy + bh / 2 - top) / scale

        x1 = max(0, min(int(x1), image_w - 1))
        y1 = max(0, min(int(y1), image_h - 1))
        x2 = max(0, min(int(x2), image_w))
        y2 = max(0, min(int(y2), image_h))

        if x2 <= x1 or y2 <= y1:
            continue

        box = [x1, y1, x2 - x1, y2 - y1]

        candidates.append((class_id, confidence, box))

    detections = []

    # Run NMS separately for each class.
    for class_id in range(len(CLASS_NAMES)):

        class_candidates = [
            item for item in candidates
            if item[0] == class_id
        ]

        if not class_candidates:
            continue

        boxes = [item[2] for item in class_candidates]
        scores = [item[1] for item in class_candidates]

        indices = cv2.dnn.NMSBoxes(
            boxes,
            scores,
            CONF_THRESHOLD,
            NMS_THRESHOLD
        )

        for i in np.asarray(indices).reshape(-1):
            _, confidence, box = class_candidates[int(i)]
            detections.append((class_id, confidence, box))

    return detections


def main():

    assert cv2.__version__.startswith("5.")
    assert MODEL_PATH.exists(), "ONNX model not found"

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Select a validation image containing
    # at least one ground-truth target.
    image_path = next(
        (
            p for p in sorted(IMAGE_DIR.glob("*.jpg"))
            if (LABEL_DIR / f"{p.stem}.txt").exists()
            and (LABEL_DIR / f"{p.stem}.txt").stat().st_size > 0
        ),
        None
    )

    if image_path is None:
        raise RuntimeError("No validation image found")

    image = cv2.imread(str(image_path))

    if image is None:
        raise RuntimeError("Image could not be loaded")

    net = cv2.dnn.readNetFromONNX(str(MODEL_PATH))

    blob, scale, left, top = preprocess(image)

    net.setInput(blob)

    output = net.forward()

    detections = postprocess(
        output, image.shape, scale, left, top
    )

    print("Image:", image_path.name)
    print("Detections:", len(detections))

    for class_id, confidence, box in detections:

        x, y, w, h = box

        label = (
            f"{CLASS_NAMES[class_id]} "
            f"{confidence:.2f}"
        )

        print(label, box)

        cv2.rectangle(
            image,
            (x, y),
            (x + w, y + h),
            (0, 255, 0),
            2
        )

        cv2.putText(
            image,
            label,
            (x, max(y - 10, 20)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (0, 255, 0),
            2
        )

    output_path = OUTPUT_DIR / image_path.name

    if not cv2.imwrite(str(output_path), image):
        raise RuntimeError("Could not save output image")

    print("Saved:", output_path)


if __name__ == "__main__":
    main()
