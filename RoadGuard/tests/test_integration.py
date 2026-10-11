"""End-to-end integration tests for RoadGuard modules."""
import pytest
from src.vision.detector import RoadDetector
from src.opencv_cool.pipeline import OpenCVPipeline
from src.agent.guard_agent import RoadGuardAgent


def test_full_pipeline_flow():
    detector = RoadDetector()
    cv_pipe = OpenCVPipeline()
    agent = RoadGuardAgent()

    # Mock video frame
    frame = object()

    # 1. Detection
    detections = detector.detect(frame)
    assert len(detections) > 0

    # 2. OpenCV motion & lane processing
    cv_result = cv_pipe.process_frame(frame)
    assert cv_result["status"] == "processed"

    # 3. Agent reasoning
    decision = agent.evaluate_scene(detections, cv_result)
    assert "threat_score" in decision
    assert "action" in decision
