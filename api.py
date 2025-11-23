from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from main import run_pipeline
from src.analytics.genai import generate_explanation, explain_metrics


app = FastAPI(title="Stress Intelligence API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PipelineRequest(BaseModel):
    source: str = Field(default="samsung", description="Data source: samsung or apple")
    data_dir: str = Field(default="data", description="Path to the data folder")


class ExplanationRequest(BaseModel):
    label: str
    confidence: float
    features: Dict[str, Any]


class MetricsRequest(BaseModel):
    features: Dict[str, Any] = Field(default_factory=dict)


@app.get("/")
def root():
    return {"message": "Stress Intelligence API is live. See /docs for interactive docs. Open /ui for the console."}


@app.get("/ui", response_class=HTMLResponse)
def ui():
    path = Path("api_frontend.html")
    if not path.exists():
        raise HTTPException(status_code=404, detail="api_frontend.html not found")
    return HTMLResponse(content=path.read_text(encoding="utf-8"), status_code=200)


@app.post("/compute-stress-pattern")
def compute_stress_pattern(payload: PipelineRequest):
    result = run_pipeline(source=payload.source, data_dir=Path(payload.data_dir))
    return {"stress": result["stress"], "features": result["features"]}


@app.post("/compute-behavioral-insights")
def compute_behavioral_insights(payload: PipelineRequest):
    result = run_pipeline(source=payload.source, data_dir=Path(payload.data_dir))
    return {"behavioral_insights": result.get("behavioral_insights", [])}


@app.post("/generate-explanation")
def generate_genai_explanation(payload: ExplanationRequest):
    text = generate_explanation(payload.label, payload.confidence, payload.features)
    return {"explanation": text}


@app.post("/explain-metrics")
def explain_metrics_endpoint(payload: MetricsRequest):
    text = explain_metrics(payload.features)
    return {"explanation": text}
