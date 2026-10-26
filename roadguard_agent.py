"""RoadGuard: evidence-driven inspection agent for recorded road videos.

Uses the GLOBAL YOLO ONNX model via opencv_detector.py (OpenCV 5 DNN),
associates repeated observations, actively reinspects selected frames, and
checks for candidate image-fixed artifacts using sparse optical flow.

This is an advisory system. It NEVER confirms damage or automatically rejects
an observation, and it does not estimate physical crack size or repair severity.

From the RoadGuard project root:
    python roadguard_agent.py
    python roadguard_agent.py --video data/videos/road_sample.mp4 --max-frames 300

Output: output/agent_global/inspection_trace.json and evidence images.
Requirements: OpenCV 5, NumPy, and existing opencv_detector.py.
"""

import argparse
import json
import math
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

import cv2
import numpy as np

from opencv_detector import CLASS_NAMES, MODEL_PATH, postprocess, preprocess

DEFAULT_VIDEO = Path("data/videos/road_sample.mp4")
DEFAULT_OUTPUT = Path("output/agent_global")


def detect(net, image):
    """Vision tool: preprocess -> global YOLO ONNX -> OpenCV DNN/NMS."""
    blob, scale, left, top = preprocess(image)
    net.setInput(blob)
    return [
        (int(cls), float(conf), tuple(int(round(v)) for v in bbox))
        for cls, conf, bbox in postprocess(net.forward(), image.shape, scale, left, top)
    ]


def iou(a, b):
    """Intersection-over-union of two [x,y,width,height] rectangles."""
    ax, ay, aw, ah = map(float, a)
    bx, by, bw, bh = map(float, b)
    ix1, iy1 = max(ax, bx), max(ay, by)
    ix2, iy2 = min(ax + aw, bx + bw), min(ay + ah, by + bh)
    intersection = max(0.0, ix2 - ix1) * max(0.0, iy2 - iy1)
    union = max(0, aw * ah) + max(0, bw * bh) - intersection
    return intersection / union if union > 0 else 0.0


def association_score(a, b):
    """Conservative image-space association (not a confirmed physical track)."""
    overlap = iou(a, b)
    if overlap >= 0.12:
        return 1.0 + overlap
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    center_distance = math.hypot(ax + aw / 2 - (bx + bw / 2),
                                 ay + ah / 2 - (by + bh / 2))
    size = max(aw, ah, bw, bh, 1)
    # Small movement + comparable scale is a weaker association fallback.
    area_ratio = min(aw * ah, bw * bh) / max(aw * ah, bw * bh, 1)
    if center_distance / size <= 0.28 and area_ratio >= 0.45:
        return 0.5 - center_distance / size
    return -1.0


def group_observations(observations, max_gap=15):
    """Group nearby, overlapping predictions; never call groups verified defects."""
    groups = []
    for obs in sorted(observations, key=lambda x: (x["frame"], -x["confidence"])):
        best_group = None
        best_score = -1.0
        for group in groups:
            last = group["observations"][-1]
            gap = obs["frame"] - last["frame"]
            if obs["class_id"] != group["class_id"] or not (0 < gap <= max_gap):
                continue
            # Never associate two separate predictions within the same frame.
            score = association_score(last["box"], obs["box"])
            if score > best_score:
                best_score, best_group = score, group
        if best_group is None:
            groups.append({"class_id": obs["class_id"], "observations": [obs]})
        else:
            best_group["observations"].append(obs)
    return groups


def mask_flow(first_gray, second_gray, mask, max_corners=100):
    """Robust sparse LK optical flow within a binary mask; None if unsupported."""
    points = cv2.goodFeaturesToTrack(
        first_gray, maxCorners=max_corners, qualityLevel=0.012,
        minDistance=6, mask=mask, blockSize=5,
    )
    if points is None or len(points) < 5:
        return None
    params = dict(winSize=(21, 21), maxLevel=3,
                  criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01))
    following, status, _ = cv2.calcOpticalFlowPyrLK(first_gray, second_gray, points, None, **params)
    if following is None or status is None:
        return None
    backwards, back_status, _ = cv2.calcOpticalFlowPyrLK(second_gray, first_gray, following, None, **params)
    if backwards is None or back_status is None:
        return None
    keep = (status.reshape(-1) == 1) & (back_status.reshape(-1) == 1)
    p0 = points.reshape(-1, 2)
    p1 = following.reshape(-1, 2)
    back = backwards.reshape(-1, 2)
    keep &= np.linalg.norm(p0 - back, axis=1) <= 2.0
    if np.count_nonzero(keep) < 5:
        return None
    displacement = p1[keep] - p0[keep]
    shift = np.median(displacement, axis=0)
    return {
        "points": int(len(displacement)),
        "shift": [float(shift[0]), float(shift[1])],
        "median_pixel_motion": float(np.median(np.linalg.norm(displacement, axis=1))),
    }


def motion_check(before, after, box):
    """Compare optical flow in the candidate box with surrounding lower-frame scene.

    This is a weak camera-fixed artifact indicator, NOT a proof of reflection.
    Road motion can be small, and road pixels behind transparent glass can move.
    """
    h, w = before.shape[:2]
    first_gray = cv2.cvtColor(before, cv2.COLOR_BGR2GRAY)
    second_gray = cv2.cvtColor(after, cv2.COLOR_BGR2GRAY)
    x, y, bw, bh = map(int, box)
    x1, y1 = max(0, x), max(0, y)
    x2, y2 = min(w, x + bw), min(h, y + bh)

    object_mask = np.zeros((h, w), dtype=np.uint8)
    if x2 > x1 and y2 > y1:
        cv2.rectangle(object_mask, (x1, y1), (x2 - 1, y2 - 1), 255, -1)
    object_flow = mask_flow(first_gray, second_gray, object_mask, max_corners=80)

    road_mask = np.zeros((h, w), dtype=np.uint8)
    polygon = np.array([
        [int(.08 * w), int(.53 * h)], [int(.92 * w), int(.53 * h)],
        [int(.98 * w), int(.90 * h)], [int(.02 * w), int(.90 * h)],
    ], dtype=np.int32)
    cv2.fillPoly(road_mask, [polygon], 255)
    border = max(12, int(w * 0.02))
    cv2.rectangle(road_mask,
                  (max(0, x1 - border), max(0, y1 - border)),
                  (min(w - 1, x2 + border), min(h - 1, y2 + border)),
                  0, -1)
    road_flow = mask_flow(first_gray, second_gray, road_mask, max_corners=130)

    result = {
        "candidate_flow": object_flow,
        "surrounding_road_flow": road_flow,
        "possible_camera_fixed_artifact": False,
        "limitation": "Sparse optical-flow heuristic; not sufficient to classify a reflection.",
    }
    if object_flow and road_flow and road_flow["points"] >= 12:
        obj_motion = object_flow["median_pixel_motion"]
        road_motion = road_flow["median_pixel_motion"]
        # Only flag when surrounding road truly appears to move, yet strong
        # candidate-region features stay nearly still in image coordinates.
        result["possible_camera_fixed_artifact"] = bool(
            road_motion >= 2.5 and obj_motion <= 0.7 and
            obj_motion / road_motion <= 0.25
        )
    return result


def shifted_box(box, shift):
    if shift is None:
        return box
    x, y, w, h = box
    return (x + shift[0], y + shift[1], w, h)


def annotated(image, predictions):
    result = image.copy()
    for class_id, confidence, box in predictions:
        x, y, w, h = box
        cv2.rectangle(result, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv2.putText(result, f"{CLASS_NAMES[class_id]} {confidence:.2f}",
                    (x, max(20, y - 7)), cv2.FONT_HERSHEY_SIMPLEX,
                    0.55, (0, 255, 0), 2)
    return result


class FrameVisionTool:
    """Seek arbitrary frames and cache vision predictions; actual reinspection tool."""
    def __init__(self, video_path, net, sampled_predictions):
        self.cap = cv2.VideoCapture(str(video_path))
        if not self.cap.isOpened():
            raise RuntimeError(f"Cannot open video for reinspection: {video_path}")
        self.net = net
        self.detections = dict(sampled_predictions)
        self.tool_inferences = 0

    def read(self, frame_index):
        self.cap.set(cv2.CAP_PROP_POS_FRAMES, int(frame_index))
        ok, frame = self.cap.read()
        return frame if ok else None

    def inspect(self, frame_index):
        image = self.read(frame_index)
        if image is None:
            return None, []
        if frame_index not in self.detections:
            self.detections[frame_index] = detect(self.net, image)
            self.tool_inferences += 1
        return image, self.detections[frame_index]

    def close(self):
        self.cap.release()


def inspect_frame(tool, seed_frame, source_index, target_index, class_id, source_box):
    target_frame, preds = tool.inspect(target_index)
    if target_frame is None:
        return {"frame": target_index, "readable": False, "matched": False}
    motion = motion_check(seed_frame, target_frame, source_box)
    region = motion["candidate_flow"]
    target_box = shifted_box(source_box, region["shift"] if region else None)
    same_class = [(conf, box) for cid, conf, box in preds if cid == class_id]
    closest = max(same_class, key=lambda p: iou(target_box, p[1]), default=None)
    similarity = iou(target_box, closest[1]) if closest else 0.0
    matching = similarity >= 0.12
    return {
        "frame": target_index,
        "readable": True,
        "matched": matching,
        "best_iou_motion_adjusted": round(similarity, 3),
        "matched_confidence": round(closest[0], 3) if matching else None,
        "matched_box_xywh": list(closest[1]) if matching else None,
        "motion": motion,
    }


def inspect_group(tool, group, frame_count, evidence_dir, event_number):
    observations = group["observations"]
    representative = max(observations, key=lambda o: o["confidence"])
    source_index = representative["frame"]
    class_id = group["class_id"]
    source_box = representative["box"]
    frame, predictions = tool.inspect(source_index)
    if frame is None:
        return None

    low_conf = representative["confidence"] < .45
    initial_offsets = [-4, -2, 2, 4] if low_conf else [-2, 2]
    tested = set()
    decisions = []
    neighbor_results = []

    def call_vision(offsets, reason):
        requests = [
            source_index + d for d in offsets
            if 0 <= source_index + d < frame_count and source_index + d not in tested
        ]
        decisions.append({
            "reason": reason,
            "tool": "inspect_frame (OpenCV 5 ONNX + sparse optical flow)",
            "requested_frames": requests,
        })
        for target in requests:
            tested.add(target)
            neighbor_results.append(inspect_frame(
                tool, frame, source_index, target, class_id, source_box,
            ))

    call_vision(initial_offsets,
                "Low-confidence candidate: inspect a wider temporal window"
                if low_conf else "Higher-confidence candidate: inspect nearest frames")

    support = sum(r.get("matched", False) for r in neighbor_results)
    if support < 2:
        # A decision is actually made after seeing the first tool results.
        call_vision([-8, 8], "Insufficient overlapping evidence: expand inspection")

    inspected = sum(r.get("readable", False) for r in neighbor_results)
    support = sum(r.get("matched", False) for r in neighbor_results)
    motion_flags = sum(
        bool(r.get("motion", {}).get("possible_camera_fixed_artifact", False))
        for r in neighbor_results
    )
    if motion_flags >= 2:
        status, action = "possible_camera_artifact_review", "human_verify_artifact"
    elif support >= 2:
        status, action = "candidate_for_human_review", "queue_for_human_review"
    else:
        status, action = "uncertain_more_evidence_needed", "request_human_inspection"

    stem = f"event_{event_number:03d}_frame_{source_index:06d}"
    original_path = evidence_dir / f"{stem}_original.jpg"
    annotated_path = evidence_dir / f"{stem}_annotated.jpg"
    if not cv2.imwrite(str(original_path), frame):
        raise RuntimeError(f"Failed to save {original_path}")
    if not cv2.imwrite(str(annotated_path), annotated(frame, predictions)):
        raise RuntimeError(f"Failed to save {annotated_path}")

    return {
        "event_id": event_number,
        "source_frame": source_index,
        "perception": {
            "class_name": CLASS_NAMES[class_id],
            "class_id": class_id,
            "confidence": round(representative["confidence"], 3),
            "bbox_xywh": list(source_box),
        },
        "association": {
            "type": "tentative_image_space_cluster_not_unique_physical_defect",
            "observations_count": len(observations),
            "frames": [o["frame"] for o in observations],
            "confidence_max": round(max(o["confidence"] for o in observations), 3),
        },
        "decisions": decisions,
        "tool_results": neighbor_results,
        "temporal_overlap_support": support,
        "frames_successfully_reinspected": inspected,
        "possible_camera_fixed_signal_count": motion_flags,
        "status": status,
        "action": action,
        "human_review_required": True,
        "evidence": {
            "original": original_path.as_posix(),
            "annotated": annotated_path.as_posix(),
        },
    }


def main():
    parser = argparse.ArgumentParser(description="RoadGuard evidence-driven inspection agent")
    parser.add_argument("--video", type=Path, default=DEFAULT_VIDEO)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--max-frames", type=int, default=300)
    parser.add_argument("--stride", type=int, default=5)
    parser.add_argument("--max-detections-per-frame", type=int, default=8)
    parser.add_argument("--max-gap", type=int, default=15,
                        help="Maximum frame gap used for tentative association")
    args = parser.parse_args()
    if min(args.max_frames, args.stride, args.max_detections_per_frame, args.max_gap) < 1:
        parser.error("Positive values required for frame limits, stride, detections, and gap")
    if not args.video.is_file():
        parser.error(f"Video missing: {args.video}")
    if not Path(MODEL_PATH).is_file():
        parser.error(f"Global ONNX model missing: {MODEL_PATH}")

    args.output.mkdir(parents=True, exist_ok=True)
    evidence_dir = args.output / "evidence"
    evidence_dir.mkdir(parents=True, exist_ok=True)
    model = cv2.dnn.readNetFromONNX(str(MODEL_PATH))

    scan_cap = cv2.VideoCapture(str(args.video))
    if not scan_cap.isOpened():
        raise RuntimeError(f"Cannot open video: {args.video}")
    observations, sample_preds = [], {}
    frames_read = frames_scanned = 0
    try:
        while frames_read < args.max_frames:
            ok, image = scan_cap.read()
            if not ok:
                break
            index = frames_read
            frames_read += 1
            if index % args.stride:
                continue
            frames_scanned += 1
            predictions = sorted(detect(model, image), key=lambda d: d[1], reverse=True)
            predictions = predictions[:args.max_detections_per_frame]
            sample_preds[index] = predictions
            for cid, confidence, bbox in predictions:
                observations.append({
                    "frame": index, "class_id": cid,
                    "confidence": confidence, "box": bbox,
                })
    finally:
        scan_cap.release()

    groups = group_observations(observations, max_gap=args.max_gap)
    tool = FrameVisionTool(args.video, model, sample_preds)
    events = []
    try:
        for number, group in enumerate(groups, start=1):
            event = inspect_group(tool, group, frames_read, evidence_dir, number)
            if event is not None:
                events.append(event)
                print(
                    f"Event {number}: {event['perception']['class_name']}, "
                    f"observations={event['association']['observations_count']}, "
                    f"neighbor support={event['temporal_overlap_support']}/"
                    f"{event['frames_successfully_reinspected']}, "
                    f"artifact signals={event['possible_camera_fixed_signal_count']}, "
                    f"status={event['status']}"
                )
    finally:
        tool.close()

    by_status = Counter(e["status"] for e in events)
    report = {
        "project": "RoadGuard",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "opencv_version": cv2.__version__,
        "model": str(MODEL_PATH),
        "source_video": str(args.video),
        "frames_read": frames_read,
        "frames_scanned": frames_scanned,
        "stride": args.stride,
        "raw_detection_observations": len(observations),
        "candidate_groups": len(groups),
        "events_count": len(events),
        "status_counts": dict(by_status),
        "additional_vision_inferences": tool.tool_inferences,
        "method_notes": [
            "Candidate groups are tentative image-space associations, NOT confirmed unique defects.",
            "Motion evidence is sparse LK optical flow on candidate and surrounding road pixels.",
            "A windshield artifact can be missed; camera motion and distant defects may be ambiguous.",
            "No detection does not mean the road is damage-free.",
            "No defect is auto-accepted or auto-rejected. Human review required.",
            "No GPS or calibrated measurement: no crack length, depth, or repair severity estimated.",
        ],
        "events": events,
    }
    path = args.output / "inspection_trace.json"
    path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"\nFrames read: {frames_read}")
    print(f"Initially sampled frames: {frames_scanned}")
    print(f"Raw detection observations: {len(observations)}")
    print(f"Tentative associated groups: {len(groups)}")
    print(f"Additional OpenCV vision inferences: {tool.tool_inferences}")
    print(f"Statuses: {dict(by_status)}")
    print(f"Saved trace: {path}")
    print(f"Evidence directory: {evidence_dir}")


if __name__ == "__main__":
    main()
