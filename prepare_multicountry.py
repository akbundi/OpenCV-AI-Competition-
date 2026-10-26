"""Build a reproducible YOLO RoadGuard dataset from labeled RDD2022 country folders.

Run from RoadGuard root: python prepare_multicountry.py
Dependencies: Pillow (python -m pip install pillow)

Original RDD2022 files are never changed. The output folder must not exist yet.
"""

from collections import Counter, defaultdict
from pathlib import Path
import csv
import random
import re
import xml.etree.ElementTree as ET

from PIL import Image

ROOT = Path(__file__).resolve().parent
RAW_DIR = ROOT / "RDD2022"
OUTPUT_DIR = ROOT / "data" / "roadguard_global"

COUNTRIES = [
    "India", "Japan", "Czech", "Norway", "United_States",
    "China_MotorBike", "China_Drone",
]
CLASS_MAPPING = {
    "D00": 0, "D01": 0,
    "D10": 1, "D11": 1,
    "D20": 2,
    "D40": 3,
}
CLASS_NAMES = [
    "LONGITUDINAL_CRACK", "TRANSVERSE_CRACK",
    "ALLIGATOR_CRACK", "OTHER_ROAD_DAMAGE",
]
SEED = 42
BACKGROUND_FRACTION = 0.15  # Select 15% of truly empty annotated images
GROUP_SIZE = 50           # Heuristic grouping by neighboring filename indices
MAX_IMAGE_SIDE = 1280     # Limit storage/compute; no crop, so normalized boxes remain valid
JPEG_QUALITY = 90


def get_image_path(images_dir, stem):
    for extension in (".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"):
        candidate = images_dir / (stem + extension)
        if candidate.is_file():
            return candidate
    return None


def make_group_id(country, stem):
    """Grouping by nearby filename IDs is a heuristic, NOT proven drive grouping."""
    match = re.search(r"_(\d+)$", stem)
    if not match:
        return (country, stem)
    return (country, int(match.group(1)) // GROUP_SIZE)


def parse_annotation(xml_path, image_width, image_height, stats):
    root = ET.parse(xml_path).getroot()
    objects = root.findall("object")
    labels = []

    for obj in objects:
        raw_class = (obj.findtext("name") or "").strip()
        if raw_class not in CLASS_MAPPING:
            stats["excluded_objects"] += 1
            continue
        bbox = obj.find("bndbox")
        try:
            if bbox is None:
                raise ValueError("missing bndbox")
            xmin = float(bbox.findtext("xmin"))
            ymin = float(bbox.findtext("ymin"))
            xmax = float(bbox.findtext("xmax"))
            ymax = float(bbox.findtext("ymax"))
        except (TypeError, ValueError):
            stats["invalid_boxes"] += 1
            continue

        xmin = max(0.0, min(xmin, image_width))
        xmax = max(0.0, min(xmax, image_width))
        ymin = max(0.0, min(ymin, image_height))
        ymax = max(0.0, min(ymax, image_height))
        if xmax - xmin < 4 or ymax - ymin < 4:
            stats["invalid_boxes"] += 1
            continue

        class_id = CLASS_MAPPING[raw_class]
        xc = (xmin + xmax) / (2 * image_width)
        yc = (ymin + ymax) / (2 * image_height)
        bw = (xmax - xmin) / image_width
        bh = (ymax - ymin) / image_height
        labels.append(f"{class_id} {xc:.6f} {yc:.6f} {bw:.6f} {bh:.6f}")
        stats[f"class_{class_id}"] += 1

    # Empty XML files are cleaner negative examples than only-excluded annotations.
    is_truly_empty = len(objects) == 0
    return labels, is_truly_empty


def load_country(country, stats):
    train_dir = RAW_DIR / country / "train"
    images_dir = train_dir / "images"
    xml_dir = train_dir / "annotations" / "xmls"
    if not images_dir.is_dir() or not xml_dir.is_dir():
        raise FileNotFoundError(f"Expected images and XML directories for {country}: {train_dir}")

    targets, backgrounds = [], []
    for xml_path in sorted(xml_dir.glob("*.xml")):
        image_path = get_image_path(images_dir, xml_path.stem)
        if image_path is None:
            stats["missing_images"] += 1
            continue
        try:
            with Image.open(image_path) as im:
                width, height = im.size  # Real dimensions, not potentially stale XML metadata
            if width < 1 or height < 1:
                raise ValueError("invalid image dimensions")
            labels, is_truly_empty = parse_annotation(xml_path, width, height, stats)
        except (ET.ParseError, OSError, ValueError) as exc:
            stats["unreadable_pairs"] += 1
            print(f"WARNING skipping {xml_path.name}: {exc}")
            continue

        sample = {
            "country": country,
            "path": image_path,
            "labels": labels,
            "group": make_group_id(country, xml_path.stem),
        }
        if labels:
            targets.append(sample)
        elif is_truly_empty:
            backgrounds.append(sample)
        else:
            stats["only_excluded_or_invalid_images"] += 1

    rng = random.Random(SEED + COUNTRIES.index(country))
    rng.shuffle(backgrounds)
    selected_backgrounds = backgrounds[:int(len(backgrounds) * BACKGROUND_FRACTION)]
    print(f"{country:17s} targets={len(targets):5d}  "
          f"true_empty={len(backgrounds):5d}  selected_empty={len(selected_backgrounds):4d}")
    return targets + selected_backgrounds


def assign_splits(country_samples, country):
    """Split filename-neighbor groups together, approximately 70/15/15 per country."""
    groups = defaultdict(list)
    for sample in country_samples:
        groups[sample["group"]].append(sample)
    group_list = list(groups.values())
    rng = random.Random(SEED + COUNTRIES.index(country))
    rng.shuffle(group_list)

    n_groups = len(group_list)
    if n_groups >= 3:
        n_val = max(1, round(n_groups * 0.15))
        n_test = max(1, round(n_groups * 0.15))
        n_train = n_groups - n_val - n_test
    else:
        # Extremely small datasets cannot form three independent grouped splits.
        n_train, n_val = (1 if n_groups else 0), (1 if n_groups == 2 else 0)
    split_samples = {"train": [], "val": [], "test": []}
    for idx, group in enumerate(group_list):
        split = "train" if idx < n_train else ("val" if idx < n_train + n_val else "test")
        split_samples[split].extend(group)
    return split_samples


def write_image(image_path, destination):
    with Image.open(image_path) as source:
        image = source.convert("RGB")
        if max(image.size) > MAX_IMAGE_SIDE:
            image.thumbnail((MAX_IMAGE_SIDE, MAX_IMAGE_SIDE), Image.Resampling.LANCZOS)
        # Aspect ratio remains the same; normalized YOLO box coordinates remain valid.
        image.save(destination, "JPEG", quality=JPEG_QUALITY)


def main():
    if OUTPUT_DIR.exists():
        raise FileExistsError(
            f"Output already exists: {OUTPUT_DIR}\n"
            "Move/rename that GENERATED folder if you want to rebuild; never delete RDD2022."
        )

    stats = Counter()
    splits = {"train": [], "val": [], "test": []}
    for country in COUNTRIES:
        samples = load_country(country, stats)
        country_splits = assign_splits(samples, country)
        for name in splits:
            splits[name].extend(country_splits[name])

    total = sum(map(len, splits.values()))
    print("\nTotal selected images:", total)
    for name, samples in splits.items():
        print(f"  {name:5s} {len(samples):6d}")

    OUTPUT_DIR.mkdir(parents=True)
    for split in splits:
        (OUTPUT_DIR / "images" / split).mkdir(parents=True)
        (OUTPUT_DIR / "labels" / split).mkdir(parents=True)

    with (OUTPUT_DIR / "manifest.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["country", "split", "source_image", "export_name", "num_objects"])
        for split, samples in splits.items():
            print(f"\nWriting {split}: {len(samples)} images")
            for index, sample in enumerate(samples, start=1):
                image_path = sample["path"]
                country = sample["country"]
                # Names are typically already country-prefixed; this also protects collisions.
                prefix = "" if image_path.stem.startswith(country + "_") else country + "_"
                stem = prefix + image_path.stem
                dest_image = OUTPUT_DIR / "images" / split / f"{stem}.jpg"
                dest_label = OUTPUT_DIR / "labels" / split / f"{stem}.txt"
                if dest_image.exists():
                    raise ValueError(f"Duplicate output filename: {dest_image}")
                write_image(image_path, dest_image)
                dest_label.write_text("\n".join(sample["labels"]), encoding="utf-8")
                writer.writerow([country, split, str(image_path), dest_image.name, len(sample["labels"])])
                if index % 1000 == 0:
                    print(f"  {index}/{len(samples)}")

    yaml_text = (
        f"path: {OUTPUT_DIR.as_posix()}\n"
        "train: images/train\nval: images/val\ntest: images/test\n"
        "names:\n"
        + "".join(f"  {i}: {name}\n" for i, name in enumerate(CLASS_NAMES))
    )
    (OUTPUT_DIR / "data.yaml").write_text(yaml_text, encoding="utf-8")

    print("\nKept object counts after cleaning:")
    for i, name in enumerate(CLASS_NAMES):
        print(f"  {name:21s} {stats[f'class_{i}']}")
    print("Excluded objects:", stats["excluded_objects"])
    print("Only excluded/invalid images skipped:", stats["only_excluded_or_invalid_images"])
    print("Invalid boxes:", stats["invalid_boxes"])
    print("Unreadable pairs:", stats["unreadable_pairs"])
    print("Missing images:", stats["missing_images"])
    print("\nSaved to:", OUTPUT_DIR)
    print("IMPORTANT: Change data.yaml 'path' to the Colab extraction path before GPU training.")


if __name__ == "__main__":
    main()
