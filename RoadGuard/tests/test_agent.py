"""Tests for RoadGuard reasoning agent."""
import pytest
from src.agent.guard_agent import RoadGuardAgent


def test_agent_initialization():
    agent = RoadGuardAgent(alert_threshold="medium")
    assert agent.alert_threshold == "medium"


def test_agent_normal_scene():
    agent = RoadGuardAgent()
    detections = []
    motion_stats = {"motion_intensity": 0.1}
    eval_result = agent.evaluate_scene(detections, motion_stats)

    assert eval_result["is_incident"] is False
    assert eval_result["action"] == "continue_monitoring"


def test_agent_incident_detected():
    agent = RoadGuardAgent()
    detections = [{"label": "vehicle"}, {"label": "vehicle"}]
    motion_stats = {"motion_intensity": 0.45}
    eval_result = agent.evaluate_scene(detections, motion_stats)

    assert eval_result["is_incident"] is True
    assert eval_result["action"] == "dispatch_alert"
