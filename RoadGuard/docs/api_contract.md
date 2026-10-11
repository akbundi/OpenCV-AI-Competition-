# RoadGuard API Contract

## Base URL
`http://localhost:8000`

---

## REST Endpoints

### 1. System Health
- **Endpoint:** `GET /api/health`
- **Response:**
```json
{
  "health": "healthy"
}
```

### 2. Trigger Inference / Evaluation
- **Endpoint:** `POST /api/v1/detect`
- **Request Body:**
```json
{
  "source_id": "cam_01",
  "frame_timestamp": "2026-10-11T18:30:00Z",
  "image_base64": "..."
}
```
- **Response:**
```json
{
  "detections": [
    {
      "label": "vehicle",
      "confidence": 0.94,
      "bbox": [120, 80, 400, 350]
    }
  ],
  "motion_stats": {
    "speed_kmh": 65.2,
    "lane_departure": false
  },
  "threat_level": "normal"
}
```

### 3. Incidents Feed
- **Endpoint:** `GET /api/v1/incidents`
- **Query Params:** `limit=50&severity=high`
- **Response:**
```json
{
  "total": 1,
  "incidents": [
    {
      "incident_id": "inc_9823",
      "timestamp": "2026-10-11T18:32:10Z",
      "severity": "critical",
      "category": "stalled_vehicle_highway",
      "evidence_url": "/outputs/evidence/inc_9823.jpg"
    }
  ]
}
```

---

## WebSocket Stream

### Real-Time Alerts
- **Endpoint:** `WS /ws/telemetry`
- **Payload Format:**
```json
{
  "event": "incident_alert",
  "data": {
    "camera_id": "cam_north_04",
    "threat_score": 0.88,
    "summary": "Vehicle stalled in active lane"
  }
}
```
