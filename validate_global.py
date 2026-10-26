from pathlib import Path
from collections import Counter

ROOT = Path("data/roadguard_global")
CLASS_NAMES = [
    "LONGITUDINAL_CRACK",
    "TRANSVERSE_CRACK",
    "ALLIGATOR_CRACK",
    "OTHER_ROAD_DAMAGE",
]

total_counts = Counter()
total_invalid = 0

for split in ["train", "val", "test"]:
    image_dir = ROOT / "images" / split
    label_dir = ROOT / "labels" / split

    images = sorted(image_dir.glob("*.jpg"))
    labels = sorted(label_dir.glob("*.txt"))

    image_names = {p.stem for p in images}
    label_names = {p.stem for p in labels}

    assert image_names == label_names, (
        f"Image/label mismatch in {split}"
    )

    counts = Counter()
    invalid = 0

    for label_file in labels:
        for line in label_file.read_text().splitlines():
            if not line.strip():
                continue

            try:
                values = list(map(float, line.split()))

                assert len(values) == 5
                class_id = int(values[0])
                assert values[0] == class_id
                assert 0 <= class_id < 4

                cx, cy, w, h = values[1:]

                assert 0 <= cx <= 1
                assert 0 <= cy <= 1
                assert 0 < w <= 1
                assert 0 < h <= 1
                EPS = 1e-5

                xmin = cx - w / 2
                xmax = cx + w / 2
                ymin = cy - h / 2
                ymax = cy + h / 2

                assert -EPS <= xmin <= 1 + EPS
                assert -EPS <= xmax <= 1 + EPS
                assert -EPS <= ymin <= 1 + EPS
                assert -EPS <= ymax <= 1 + EPS

                counts[class_id] += 1

            except (ValueError, AssertionError) as error:
                invalid += 1

                if invalid <= 5:
                    print(
                        f"INVALID: {label_file.name} "
                        f"| {line} | {error}"
                    )

    print(f"\n{split.upper()}")
    print(f"Images: {len(images)}")
    print(f"Labels: {len(labels)}")
    print(f"Invalid annotations: {invalid}")

    for class_id, name in enumerate(CLASS_NAMES):
        print(f"  {name}: {counts[class_id]}")

    total_counts.update(counts)
    total_invalid += invalid

print("\nFINAL SUMMARY")
print("Total valid annotations:", sum(total_counts.values()))
print("Total invalid annotations:", total_invalid)