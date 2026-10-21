# RoadGuard — Agentic Road Inspection System

## What it is
A frontend for an agentic road-inspection system that observes road imagery/video, detects damage, verifies across multiple frames, assesses severity, and generates a maintenance report requiring human approval.

## The agentic loop
`OBSERVE` → `VERIFY` → `RECHECK` → `ASSESS` → `REPORT` → `HUMAN REVIEW`

## Damage classes (RDD2022)
- **D00** Longitudinal Crack
- **D10** Transverse Crack
- **D20** Alligator Crack
- **D40** Pothole

## Demo flow
1. **Dashboard** → `/new` → upload image or video run
2. **Live Inspection** shows agent state machine running in real time
3. **Evidence timeline**: 7 frames, confidence climbing `62% → 74% → 82% → 88% → 90% → 91%`
4. **Severity** assessed as `HIGH` (cavity in active wheelpath)
5. **Report generated** → `HUMAN APPROVAL REQUIRED`
6. **Approve** → work order authorized, persisted to History and Reports

## Tech stack
React 19 · Vite · TypeScript · Tailwind CSS · Recharts · Zustand · Framer Motion · lucide-react

## Backend status
Frontend-only. All data flows through `src/services/api.ts` which currently delegates to `src/services/mock/`. To connect a real backend, set `USE_MOCK = false` in `src/config.ts` and point `API_BASE_URL` at your endpoint.

## Run locally
```bash
npm install
npm run dev
```

App will be available at `http://localhost:5173/`.

## Project structure
```
src/
├── components/
│   ├── agent/         # Stepper workflow, event log, decision cards
│   ├── demo/          # Dev component showcase
│   ├── evidence/      # Bounding boxes, overlays, evidence gallery
│   ├── inspection/    # Detection panels, severity cards, approval gates, previews
│   ├── layout/        # Modern Obsidian navigation bar & app frame
│   └── ui/            # Badges, bars, metrics, and Loading/Empty/Error primitives
├── pages/             # Dashboard, New, Live Cockpit, History, Reports, Benchmarks
├── services/          # Canonical API client and deterministic mock simulation
│   └── mock/          # 18 seeded inspections, simulation engine, SVG road generators
├── store/             # Global client state (theme, preferences)
├── types/             # Strict TypeScript domain schemas (Agent, Inspection, Report)
└── config.ts          # Endpoint & simulation runtime switches
```
