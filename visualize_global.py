
from pathlib import Path
import random
import cv2

DATASET = Path("data/roadguard_global")
OUTPUT = Path("output/global_label_checks")

COUNTRIES = [
    "India",
    "Japan",
    "Czech",
    "Norway",
    "United_States",
    "China_MotorBike",
    "China_Drone",
]

CLASS_NAMES = [
    "LONGITUDINAL_CRACK",
    "TRANSVERSE_CRACK",
    "ALLIGATOR_CRACK",
    "OTHER_ROAD_DAMAGE",
]

COLORS = [
    (0, 255, 0),
    (255, 0, 0),
    (0, 165, 255),
    (255, 0, 255),
]

random.seed(42)
OUTPUT.mkdir(parents=True, exist_ok=True)

image_dir = DATASET / "images" / "val"
label_dir = DATASET / "labels" / "val"

for country in COUNTRIES:

    candidates = []

    for image_path in image_dir.glob(f"{country}_*.jpg"):
        label_path = label_dir / f"{image_path.stem}.txt"

        if label_path.exists() and label_path.read_text().strip():
            candidates.append(image_path)

    selected = random.sample(
        candidates, min(3, len(candidates))
    )

    print(f"\n{country}: {len(selected)} images")

    for image_path in selected:

        image = cv2.imread(str(image_path))

        if image is None:
            print("Could not read:", image_path)
            continue

        height, width = image.shape[:2]

        label_path = label_dir / f"{image_path.stem}.txt"

        for line in label_path.read_text().splitlines():

            if not line.strip():
                continue

            values = list(map(float, line.split()))

            class_id = int(values[0])
            cx, cy, bw, bh = values[1:]

            x1 = int((cx - bw / 2) * width)
            y1 = int((cy - bh / 2) * height)
            x2 = int((cx + bw / 2) * width)
            y2 = int((cy + bh / 2) * height)

            x1 = max(0, min(x1, width - 1))
            y1 = max(0, min(y1, height - 1))
            x2 = max(0, min(x2, width - 1))
            y2 = max(0, min(y2, height - 1))

            color = COLORS[class_id]

            cv2.rectangle(
                image, (x1, y1), (x2, y2), color, 2
            )

            cv2.putText(
                image,
                CLASS_NAMES[class_id],
                (x1, max(y1 - 8, 20)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                color,
                2,
            )

        save_path = OUTPUT / image_path.name

        cv2.imwrite(str(save_path), image)

        print("Saved:", save_path)

print("\nVisual validation complete.")
