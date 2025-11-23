# Hugging Twins

Digital Twin Monitoring for Connected Devices

<img src="images/logo.png" alt="Digital Twin illustration" width="400" />

## Health Twin Dashboard

This repo now ships with a lightweight dashboard that blends Samsung Health exports with a short questionnaire to estimate biological age, show current health state, analyze trends, and project a 10-year outlook.

## Stress Intelligence Pipeline (Apple/Samsung Health)

```
Samsung Health (CSV)
        ↓
Data Harmonization Layer
        ↓
Feature Extraction (HRV, RHR, Sleep, Respiration, Activity)
        ↓
------------------------------
|  Stress Intelligence Engine |
------------------------------
        ↓
(A) Stress Pattern Classifier  →  Stress Cause (5-class)
(B) Behavioral Pattern Agent   →  Longitudinal insights
(C) GenAI Explanation Layer    →  Human-readable insights
        ↓
Frontend / App / API consumer
```

Three intelligence layers: deterministic + ML hybrid, longitudinal pattern extraction, and GenAI interpretation (NetMind).

### Stress pipeline quickstart

1. Create a local environment: `python -m venv venv`
2. Activate the local env: `source venv/bin/activate`
3. Install deps: `pip install -r requirements.txt`
4. Add your NetMind key to `.env` (copy `.env.example`): `NETMIND_APY_KEY=...`
5. Run the pipeline (Samsung by default): `python main.py`

Outputs a JSON payload with engineered features, 5-class stress scores, and an optional GenAI explanation if `NETMIND_APY_KEY` is set.

### How the stress engine works

- **Harmonization** (`src/harmonization.py`): Samsung CSVs are cleaned and resampled.
  - Resting HR: hourly series from `tracker.heart_rate`.
  - Sleep: nightly duration from `sleep_combined`.
  - Steps/activity, respiration, HRV (if available) get similar treatment.
- **Feature extraction** (`src/features.py`): rolling baselines and deltas.
  - `rhr_mean`, `rhr_elevated` use 24h resting-HR baselines.
  - `sleep_avg`, `sleep_deficit`, `sleep_regular` use 7-day nightly patterns.
  - `hrv_drop_pct`, `steps_std`, `stress_index_proxy` combine HRV, HR, sleep, and activity.
  - These features feed both the classifier and dashboard metrics.
- **Stress pattern classifier** (`src/stress_engine.py`): hybrid rules + placeholder ML.
  - Rules map feature combos to five causes: physiological, cognitive/mental, recovery deficit, circadian disruption, lifestyle-driven.
  - Scores are normalized, blended with ML priors, and the max label is the predicted cause.
  - `health_dashboard.py` separately computes trend stats for the UI (steps, sleep, resting HR, stress score, weight).

### API endpoints

- `POST /compute-stress-pattern` → runs pipeline, returns stress class/scores and features
- `POST /compute-behavioral-insights` → returns longitudinal pattern insights
- `POST /generate-explanation` → GenAI explanation for a supplied label/confidence/features
- `POST /explain-metrics` → GenAI explanation for calculated metrics
- `GET /iu` → User dashboard

Run the API locally:
`uvicorn api:app --reload --port 8001`

Interactive console: once the API is running, open `http://127.0.0.1:8001/ui` to use the built-in console (no manual file open).