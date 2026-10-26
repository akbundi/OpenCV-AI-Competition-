
from pathlib import Path
import cv2

from opencv_detector import (
    preprocess,
    postprocess,
    CLASS_NAMES,
    MODEL_PATH,
)

VIDEO_PATH = Path("data/videos/road_sample.mp4")
ORIGINAL_FRAMES_DIR = Path("output/frames/original")
ANNOTATED_FRAMES_DIR = Path("output/frames/annotated")

# Classes representing cracks
CRACK_CLASSES = {0, 1, 2}
OUTPUT_PATH = Path("output/videos/roadguard_global_output.mp4")

MAX_FRAMES = 300


def process_video():

    if not VIDEO_PATH.exists():
        raise FileNotFoundError(VIDEO_PATH)

    OUTPUT_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    ORIGINAL_FRAMES_DIR.mkdir(
    parents=True,
    exist_ok=True
    )

    ANNOTATED_FRAMES_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    net = cv2.dnn.readNetFromONNX(str(MODEL_PATH))

    cap = cv2.VideoCapture(str(VIDEO_PATH))

    if not cap.isOpened():
        raise RuntimeError("Cannot open input video")

    fps = cap.get(cv2.CAP_PROP_FPS)
    fps = fps if fps > 0 else 25

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    writer = cv2.VideoWriter(
        str(OUTPUT_PATH),
        cv2.VideoWriter_fourcc(*"mp4v"),
        fps,
        (width, height),
    )

    if not writer.isOpened():
        cap.release()
        raise RuntimeError("Cannot create output video")

    frame_count = 0
    frames_with_damage = 0
    saved_crack_frames = 0
    try:
        while frame_count < MAX_FRAMES:

            ret, frame = cap.read()

            if not ret:
                break

            blob, scale, left, top = preprocess(frame)

            net.setInput(blob)

            output = net.forward()

            detections = postprocess(
                output,
                frame.shape,
                scale,
                left,
                top,
            )

            crack_detections = [
            detection
            for detection in detections
            if detection[0] in CRACK_CLASSES
            ]

            if crack_detections:

                original_frame_path = (
                    ORIGINAL_FRAMES_DIR
                    / f"crack_frame_{frame_count:06d}.jpg"
                )

                cv2.imwrite(
                    str(original_frame_path),
                    frame
                )

            if detections:
                frames_with_damage += 1

            for class_id, confidence, box in detections:

                x, y, w, h = box

                label = (
                    f"{CLASS_NAMES[class_id]} "
                    f"{confidence:.2f}"
                )

                cv2.rectangle(
                    frame,
                    (x, y),
                    (x + w, y + h),
                    (0, 255, 0),
                    2,
                )

                cv2.putText(
                    frame,
                    label,
                    (x, max(y - 10, 20)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (0, 255, 0),
                    2,
                )

            if crack_detections:
                annotated_frame_path = (
                    ANNOTATED_FRAMES_DIR
                    / f"crack_frame_{frame_count:06d}.jpg"
                )
                cv2.imwrite(
                    str(annotated_frame_path),
                    frame)

                saved_crack_frames += 1

            writer.write(frame)
            frame_count += 1

    finally:
        cap.release()
        writer.release()

    print("Frames processed:", frame_count)
    print("Frames with detections:", frames_with_damage)
    print("Output saved:", OUTPUT_PATH)
    print("Crack frames saved:", saved_crack_frames)
    print("Original frames:", ORIGINAL_FRAMES_DIR)
    print("Annotated frames:", ANNOTATED_FRAMES_DIR)


if __name__ == "__main__":
    process_video()
