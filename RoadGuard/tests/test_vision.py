"""Tests for RoadGuard vision detection pipeline."""
import pytest
from src.vision.detector import RoadDetector


def test_road_detector_initialization():
    detector = RoadDetector(model_path="models/yolov8n.pt", confidence_threshold=0.5)
    assert detector.model_path == "models/yolov8n.pt"
    assert detector.confidence_threshold == 0.5


def test_road_detector_none_frame():
    detector = RoadDetector()
    results = detector.detect(None)
    assert results == []


def test_road_detector_mock_frame():
    detector = RoadDetector()
    mock_frame = object()
    results = detector.detect(mock_frame)
    assert len(results) > 0
    assert results[0]["label"] == "vehicle"
    assert results[0]["confidence"] >= 0.5
