from pathlib import Path
import xml.etree.ElementTree as ET
from collections import Counter

XML_DIR = Path("RDD2022/India/train/annotations/xmls")

CLASS_MAPPING = {
    "D00": 0,
    "D01": 0,

    "D10": 1,
    "D11": 1,

    "D20": 2,

    "D40": 3,
}

CLASS_NAMES = {
    0: "LONGITUDINAL_CRACK",
    1: "TRANSVERSE_CRACK",
    2: "ALLIGATOR_CRACK",
    3: "OTHER_ROAD_DAMAGE",
}

mapped_counts = Counter()
excluded_counts = Counter()
images_with_target = 0
background_images = 0

for xml_File in XML_DIR.glob("*.xml"):
    tree = ET.parse(xml_File)
    root = tree.getroot()
    objects = root.findall("object")
    images_has_target = False

    for obj in objects:
        original_class = obj.findtext("name")

        if original_class in CLASS_MAPPING:
            new_class = CLASS_MAPPING[original_class]
            mapped_counts[new_class] += 1
            images_has_target = True
        else:
            excluded_counts[original_class] += 1

    if images_has_target:
        images_with_target += 1
    else:
        background_images += 1

print("\n===== ROADGUARD MAPPING =====")

for class_id, class_name in mapped_counts.items():
     print(
        f"Class {class_id}: "
        f"{class_name:<25} "
        f"{mapped_counts[class_id]} objects"
    )

print("\n===== EXCLUDED CLASSES =====")

for class_name, count in excluded_counts.most_common():
    print(f"{class_name}: {count}")

print("\n===== IMAGE SUMMARY =====")

total_images = images_with_target + background_images

print(f"Total images:          {total_images}")
print(f"Images with targets:   {images_with_target}")
print(f"Background images:     {background_images}")

print("\nTotal kept objects:",
      sum(mapped_counts.values()))

print("Total excluded objects:",
      sum(excluded_counts.values()))
     