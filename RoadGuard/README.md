# RoadGuard 🛡️🚗

RoadGuard is an intelligent road monitoring and automated safety inspection system combining computer vision, OpenCV video analytics, autonomous agents, and real-time backend/frontend reporting.

---

## 📁 Project Structure

```text
RoadGuard/
├── README.md                           # Project overview and setup guide
├── requirements.txt                    # Project dependencies
├── .gitignore                          # Git ignore rules
├── config/
│   └── settings.yaml                   # Core configuration parameters
├── data/
│   ├── raw/                            # Raw video feeds and footage
│   ├── processed/                      # Preprocessed/annotated datasets
│   └── sample/                         # Sample test media for quick demos
├── models/
│   └── README.md                       # Model checkpoints & weights setup
├── src/
│   ├── vision/                         # Deep learning object detection & tracking
│   ├── opencv_cool/                    # Advanced OpenCV image processing & optical flow
│   ├── agent/                          # Autonomous decision-making and report agents
│   ├── backend/                        # REST & WebSocket API services
│   └── frontend/                       # Interactive UI / dashboard
├── tests/
│   ├── test_vision.py                  # Unit tests for vision pipeline
│   ├── test_agent.py                   # Unit tests for agent reasoning
│   └── test_integration.py            # End-to-end integration tests
├── benchmarks/
│   ├── scripts/                        # Performance and latency benchmark scripts
│   └── results/                        # Benchmark metrics and logs
├── outputs/
│   ├── evidence/                       # Captured violation/anomaly snapshots & clips
│   └── reports/                        # Generated PDF/JSON safety audit reports
├── docs/
│   ├── architecture.md                 # System architecture overview
│   └── api_contract.md                 # API endpoints and schemas
└── demo/                               # Interactive demo walkthroughs & assets
```

---

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration
Review and customize parameters in [config/settings.yaml](config/settings.yaml).

### 3. Running Tests
```bash
pytest tests/
```
