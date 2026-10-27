from pathlib import Path
import random
import cv2

# =========================
# PATHS
# =========================

IMAGE_DIR = Path("data/roadguard/images/train")
LABEL_DIR = Path("data/roadguard/labels/train")
OUTPUT_DIR = Path("data/roadguard/visualization")

# =========================
# SETTINGS
# =========================

NUM_IMAGES = 12
RANDOM_SEED = 42

CLASS_NAMES = {
    0: "LONGITUDINAL_CRACK",
    1: "TRANSVERSE_CRACK",
    2: "ALLIGATOR_CRACK",
    3: "OTHER_ROAD_DAMAGE",
}

random.seed(RANDOM_SEED)


def yolo_to_pixel(
    x_center,
    y_center,
    width,
    height,
    image_width,
    image_height
):
    """
    Convert YOLO normalized coordinates
    back to pixel coordinates.
    """

    x_center *= image_width
    y_center *= image_height
    width *= image_width
    height *= image_height

    xmin = int(x_center - width / 2)
    ymin = int(y_center - height / 2)
    xmax = int(x_center + width / 2)
    ymax = int(y_center + height / 2)

    return xmin, ymin, xmax, ymax


def draw_labels(image_path, label_path, output_path):

    image = cv2.imread(str(image_path))

    if image is None:
        print(f"Could not read image: {image_path}")
        return

    image_height, image_width = image.shape[:2]

    if label_path.exists():

        with open(label_path, "r", encoding="utf-8") as f:
            lines = f.readlines()

        for line in lines:

            line = line.strip()

            # Empty label = background image
            if not line:
                continue

            parts = line.split()

            if len(parts) != 5:
                continue

            class_id = int(parts[0])

            x_center = float(parts[1])
            y_center = float(parts[2])
            width = float(parts[3])
            height = float(parts[4])

            xmin, ymin, xmax, ymax = yolo_to_pixel(
                x_center,
                y_center,
                width,
                height,
                image_width,
                image_height
            )

            class_name = CLASS_NAMES[class_id]

            # Draw bounding box
            cv2.rectangle(
                image,
                (xmin, ymin),
                (xmax, ymax),
                (0, 255, 0),
                2
            )

            # Draw class name
            cv2.putText(
                image,
                class_name,
                (xmin, max(ymin - 8, 20)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 255, 0),
                2
            )

    cv2.imwrite(str(output_path), image)


def main():

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    images = list(IMAGE_DIR.glob("*.jpg"))

    print(f"Total training images: {len(images)}")

    selected_images = random.sample(
        images,
        min(NUM_IMAGES, len(images))
    )

    print(
        f"Visualizing {len(selected_images)} images..."
    )

    for image_path in selected_images:

        label_path = (
            LABEL_DIR
            / f"{image_path.stem}.txt"
        )

        output_path = (
            OUTPUT_DIR
            / image_path.name
        )

        draw_labels(
            image_path,
            label_path,
            output_path
        )

        print(
            f"Created: {output_path}"
        )

    print("\nVisualization completed.")
    print(
        f"Open the images in: {OUTPUT_DIR}"
    )


if __name__ == "__main__":
    main()