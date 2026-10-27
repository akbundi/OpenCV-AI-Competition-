from pathlib import Path
import random
import shutil
import xml.etree.ElementTree as ET

SOURCE_DIR = Path("RDD2022/India/train")

IMAGE_DIR = SOURCE_DIR / "images"
XML_DIR = SOURCE_DIR / "annotations" / "xmls"
OUTPUT_DIR = Path("data/roadguard")

# =========================
# ROADGUARD CLASS MAPPING
# =========================

CLASS_MAPPING = {
    "D00": 0,
    "D01": 0,

    "D10": 1,
    "D11": 1,

    "D20": 2,

    "D40": 3,
}


CLASS_NAMES = [
    "LONGITUDINAL_CRACK",
    "TRANSVERSE_CRACK",
    "ALLIGATOR_CRACK",
    "OTHER_ROAD_DAMAGE",
]

# =========================
# REPRODUCIBILITY
# =========================

RANDOM_SEED = 42

TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

BACKGROUND_RATIO = 0.15



random.seed(RANDOM_SEED)

def convert_box_to_yolo(xmin, ymin, xmax, ymax, image_width, image_height):

    """
    Convert Pascal VOC bounding box coordinates to YOLO format.

    Pascal VOC:
        xmin, ymin, xmax, ymax

    YOLO:
        center_x, center_y, width, height

    All YOLO coordinates are normalized between 0 and 1.
    """

    box_width = xmax - xmin
    box_height = ymax - ymin
    center_x = xmin + (box_width / 2)
    center_y = ymin + (box_height / 2)

    center_x /= image_width
    center_y /= image_height
    box_width /= image_width
    box_height /= image_height

    return center_x, center_y, box_width, box_height

def clean_box(xmin, ymin, xmax, ymax, image_width, image_height):
    """
    Ensure that bounding box coordinates are within the image boundaries.
    """

    # Clip coordinates to image boundaries
    xmin = max(0, min(xmin, image_width))
    ymin = max(0, min(ymin, image_height))
    xmax = max(0, min(xmax, image_width))
    ymax = max(0, min(ymax, image_height))

    # Reject flipped or zero-area boxes

    if xmax <= xmin or ymax <= ymin:
        return None

    # calculate the dimensions of the box

    box_width = xmax - xmin
    box_height = ymax - ymin
    if box_width < 4 or box_height < 4:
        return None

    return xmin, ymin, xmax, ymax

def process_annotation(xml_file):
    """
    Read one Pascal VOC XML file and convert
    supported annotations into YOLO label lines.

    """

    tree = ET.parse(xml_file)
    root = tree.getroot()
    image_width = int(root.find("size/width").text)
    image_height = int(root.find("size/height").text)

    yolo_lines = []

    for obj in root.findall("object"):
        original_class = obj.findtext("name")

        if original_class not in CLASS_MAPPING:
            continue

        class_id = CLASS_MAPPING[original_class]

        bbox = obj.find("bndbox")

        xmin = float(bbox.findtext("xmin"))
        ymin = float(bbox.findtext("ymin"))
        xmax = float(bbox.findtext("xmax"))
        ymax = float(bbox.findtext("ymax"))

        cleaned_box = clean_box(xmin, ymin, xmax, ymax, image_width, image_height)

        if cleaned_box is None:
            continue

        xmin, ymin, xmax, ymax = cleaned_box

        center_x, center_y, box_width, box_height = convert_box_to_yolo(xmin, ymin, xmax, ymax, image_width, image_height)

        line = (
            f"{class_id} "
            f"{center_x:.6f} "
            f"{center_y:.6f} "
            f"{box_width:.6f} "
            f"{box_height:.6f}"
        )

        yolo_lines.append(line)

    return yolo_lines

def create_dataset():
    """
    Process the RDD2022 India dataset and create
    a YOLO-compatible RoadGuard dataset.
    """

     # ---------------------------------
    # Find all XML files
    # ---------------------------------

    xml_files = list(XML_DIR.glob("*.xml"))

    print(f"Found {len(xml_files)} XML files in {XML_DIR}")

    target_samples = []
    background_samples = []

    for xml_file in xml_files:

        yolo_lines = process_annotation(xml_file)

        image_name  =xml_file.stem + ".jpg"

        image_path = IMAGE_DIR / image_name

        if not image_path.exists():
            print(f"Warning: Image file {image_path} does not exist. Skipping.")
            continue


        if yolo_lines:
            target_samples.append((image_path, yolo_lines))
        else:
            background_samples.append((image_path, []))

    print(f"\nTarget images: {len(target_samples)}")
    print(f"Background images: {len(background_samples)}")

    # ---------------------------------
    # Select background images
    # ---------------------------------
    random.shuffle(background_samples)

    background_count = int(len(background_samples) * BACKGROUND_RATIO)

    selected_background = background_samples[:background_count]

    print(f"Selected images: "
          f"{len(selected_background)} background images")

    # ---------------------------------
    # Combine samples
    # ---------------------------------

    samples = target_samples + selected_background

    random.shuffle(samples)

    print(f"\nTotal dataset images: {len(samples)}")

    # ---------------------------------
    # Split dataset
    # ---------------------------------

    total = len(samples)
    train_end = int(total * TRAIN_RATIO)
    val_end = train_end + int(total * VAL_RATIO)

    train_samples = samples[:train_end]
    val_samples = samples[train_end:val_end]
    test_samples = samples[val_end:]

    print("\nDataset split:")
    print(f"Train: {len(train_samples)}")
    print(f"Val:   {len(val_samples)}")
    print(f"Test:  {len(test_samples)}")

    for split in ["train", "val", "test"]:
        (OUTPUT_DIR / "images" / split).mkdir(parents=True, exist_ok=True)
        (OUTPUT_DIR / "labels" / split).mkdir(parents=True, exist_ok=True)

    split_data = {
        "train": train_samples,
        "val": val_samples,
        "test": test_samples,
    }

    for split, samples in split_data.items():
        print(f"\n Creating {split} dataset with {len(samples)} samples...")

        for image_path, yolo_lines in samples:
            destination_image = (OUTPUT_DIR / "images" / split / image_path.name)
            shutil.copy2(image_path, destination_image)

            label_path = (OUTPUT_DIR / "labels" / split / (image_path.stem + ".txt"))

            with open(label_path, "w", encoding="utf-8") as f:
                if yolo_lines:
                    f.write("\n".join(yolo_lines))

    print("\nDataset creation completed.")


if __name__ == "__main__":
    create_dataset()
