# Stress Atlas by Hugging Twins

Digital Twin Monitoring for Connected Devices

<img src="images/logo.png" alt="Digital Twin illustration" width="400" />

## Stress Atlas Dashboard

This repo now ships with a lightweight dashboard that blends Samsung Health exports with a short questionnaire to estimate biological age, show current health state, analyze trends, and project a 10-year outlook.

## Stress Atlas Pipeline (Samsung Health)

```
Samsung Health (CSV)
        ↓
Data Harmonization Layer
        ↓
Feature Extraction (HRV, RHR, Sleep, Respiration, Activity)
        ↓
-------------------------------------
|  Stress Atlas Intelligence Engine |
-------------------------------------
        ↓
(A) Stress Pattern Classifier  →  Stress Cause (5-class)
(B) Behavioral Pattern Agent   →  Longitudinal insights
(C) GenAI Explanation Layer    →  Human-readable insights
        ↓
Frontend / App / API consumer
```

Three intelligence layers: rule-based stress reasoning, longitudinal pattern extraction, and GenAI interpretation (NetMind).

### Stress pipeline quickstart

1. Create a local environment: `python -m venv venv`
2. Activate the local env: `source venv/bin/activate`
3. Install deps: `pip install -r requirements.txt`
4. Add Samsung data into `data/` folder
5. Add your NetMind key to `.env` (copy `.env.example`): `NETMIND_APY_KEY=...`
6. Run the pipeline: `python main.py`

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
- **Stress pattern classifier** (`src/stress_engine.py`): rule-based scoring + PatchTST scoring.
  - Rules map feature combos to five causes: physiological, cognitive/mental, recovery deficit, circadian disruption, lifestyle-driven.
  - Scores are normalized and the max label is the predicted cause (no ML blend).
  - `health_dashboard.py` separately computes trend stats for the UI (steps, sleep, resting HR, stress score, weight).

### Overall workflow

1. **Data ingest** (`src/data_loader.py`): read Samsung CSV exports, fix metadata rows, align columns.
2. **Harmonization** (`src/harmonization.py`): resample each signal (hourly HR/respiration, nightly sleep, daily steps).
3. **Feature engineering** (`src/features.py`): compute rolling baselines, deviations, and stress proxies.
4. **Stress engine** (`src/stress_engine.py`): rule-based 5-class classification + GenAI narrative.
5. **Behavioral insights** (`src/behavior_agent.py`): detect correlations / weekly patterns.
6. **APIs & UI** (`api.py`, `api_frontend.html`, `dashboard.html`): expose endpoints, interactive console, and dashboards.

### Running backend + frontend together

Backend (FastAPI):

1. `uvicorn api:app --reload --port 8001`
2. API endpoints:
   - `POST /compute-stress-pattern`
   - `POST /compute-behavioral-insights`
   - `POST /explain-metrics`
   - `GET /user-dashboard`
3. UI console served at `http://127.0.0.1:8001/ui`.
