from pathlib import Path
import xml.etree.ElementTree as ET
from collections import Counter

XML_DIR = Path("RDD2022/India/train/annotations/xmls")

class_counts = Counter()
no_damage = 0
total_objects = 0

for xml_file in XML_DIR.glob("*.xml"):
    tree = ET.parse(xml_file)
    root = tree.getroot()

    objects = root.findall("object")
    if not objects:
        no_damage += 1
        continue
    for obj in objects:
        class_name = obj.findtext("name")
        if class_name:
            class_counts[class_name] += 1
            total_objects += 1
print("Total XML files:", len(list(XML_DIR.glob("*.xml"))))
print("Images with no objects:", no_damage)
print("Total annotated objects:", total_objects)

print("\nClass distribution:")
for class_name, count in class_counts.most_common():
    print(f"{class_name}: {count}")