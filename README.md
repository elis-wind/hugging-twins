# Hugging Twins

Digital Twin Monitoring for Connected Devices

<img src="images/logo.png" alt="Digital Twin illustration" width="400" />

## Health Twin Dashboard

This repo now ships with a lightweight dashboard that blends Samsung Health exports with a short questionnaire to estimate biological age, show current health state, analyze trends, and project a 10-year outlook.

## Stress Intelligence Pipeline (Apple/Samsung Health)

```
Apple Health / Samsung Health (CSV)
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

### API endpoints

- `POST /compute-stress-pattern` → runs pipeline, returns stress class/scores and features  
- `POST /compute-behavioral-insights` → returns longitudinal pattern insights  
- `POST /generate-explanation` → GenAI explanation for a supplied label/confidence/features  
- `GET /user-dashboard` → serves `data/health_summary.json` for frontend consumption  

Run the API locally:  
`uvicorn api:app --reload --port 8001`

Interactive console: once the API is running, open `http://127.0.0.1:8001/ui` to use the built-in console (no manual file open).