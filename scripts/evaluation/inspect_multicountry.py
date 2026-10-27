
from pathlib import Path
from collections import Counter
import xml.etree.ElementTree as ET

DATASET_ROOT = Path("RDD2022")

for country_dir in sorted(DATASET_ROOT.iterdir()):

    if not country_dir.is_dir():
        continue

    train_dir = country_dir / "train"

    if not train_dir.exists():
        continue

    image_files = sorted(
        p for p in train_dir.rglob("*")
        if p.suffix.lower() in {".jpg", ".jpeg", ".png"}
    )

    xml_files = sorted(train_dir.rglob("*.xml"))

    class_counts = Counter()
    empty_annotations = 0
    invalid_xml = 0

    for xml_file in xml_files:
        try:
            root = ET.parse(xml_file).getroot()
        except ET.ParseError:
            invalid_xml += 1
            continue

        objects = root.findall("object")

        if not objects:
            empty_annotations += 1

        for obj in objects:
            name = obj.findtext("name")
            if name:
                class_counts[name] += 1

    print(f"\n{'=' * 45}")
    print(f"COUNTRY: {country_dir.name}")
    print(f"{'=' * 45}")

    print("Training images:", len(image_files))
    print("XML annotations:", len(xml_files))
    print("Empty annotations:", empty_annotations)
    print("Invalid XML files:", invalid_xml)

    print("\nExample image:")
    print(image_files[0] if image_files else "None")

    print("\nExample annotation:")
    print(xml_files[0] if xml_files else "None")

    print("\nClass distribution:")
    for name, count in class_counts.most_common():
        print(f"  {name}: {count}")
