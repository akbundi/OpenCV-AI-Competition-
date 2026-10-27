from pathlib import Path
from collections import Counter

LABEL_DIR = Path("data/roadguard/labels")

valid_classes = {0, 1, 2, 3}

class_counts = Counter()
invalid_lines = []

for split in ["train", "val", "test"]:

    split_dir = LABEL_DIR / split

    for label_file in split_dir.glob("*.txt"):

        with open(label_file, "r", encoding="utf-8") as f:
            lines = f.readlines()

        for line_number, line in enumerate(lines, start=1):

            line = line.strip()

            # Empty label = background image
            if not line:
                continue

            parts = line.split()

            if len(parts) != 5:
                invalid_lines.append(
                    f"{label_file} line {line_number}: {line}"
                )
                continue

            class_id = int(parts[0])

            if class_id not in valid_classes:
                invalid_lines.append(
                    f"{label_file} line {line_number}: invalid class {class_id}"
                )
                continue

            class_counts[class_id] += 1


print("\n===== YOLO LABEL VALIDATION =====")

print(f"Class 0: {class_counts[0]}")
print(f"Class 1: {class_counts[1]}")
print(f"Class 2: {class_counts[2]}")
print(f"Class 3: {class_counts[3]}")

print("\n===== INVALID LABELS =====")

if invalid_lines:
    print(f"Found {len(invalid_lines)} invalid lines")

    for item in invalid_lines[:20]:
        print(item)
else:
    print("No invalid labels found.")

print("\n===== CLASS MAPPING =====")

print("0 → LONGITUDINAL_CRACK")
print("1 → TRANSVERSE_CRACK")
print("2 → ALLIGATOR_CRACK")
print("3 → OTHER_ROAD_DAMAGE")