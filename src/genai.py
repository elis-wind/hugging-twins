from __future__ import annotations

import os
from typing import Dict, Optional

import httpx
from openai import OpenAI

from dotenv import load_dotenv

load_dotenv()


NETMIND_BASE = "https://api.netmind.ai/inference-api/openai/v1"
NETMIND_MODEL = "Qwen/Qwen3-235B-A22B-Instruct-2507"


def _client():
    api_key = os.getenv("NETMIND_APY_KEY")
    if not api_key:
        return None
    try:
        http_client = httpx.Client(timeout=20)
        return OpenAI(base_url=NETMIND_BASE, api_key=api_key, http_client=http_client)
    except TypeError:
        # Handle older httpx/openai mismatches without crashing the pipeline.
        return None


def generate_explanation(label: str, confidence: float, features: Dict[str, float]) -> str:
    client = _client()
    if not client:
        return f"{label} (confidence {confidence:.2f}). Set NETMIND_APY_KEY to generate GenAI explanations."

    prompt = (
        "You are a health stress interpreter. Given a predicted stress class and numerical features, "
        "produce a concise, human-readable explanation (1-2 sentences) that cites the key signals.\n\n"
        f"Predicted class: {label}\n"
        f"Confidence: {confidence:.2f}\n"
        f"Features: {features}\n"
    )
    try:
        response = client.chat.completions.create(
            model=NETMIND_MODEL,
            messages=[
                {"role": "system", "content": "Act like you are a helpful assistant."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=160,
            temperature=0.4,
        )
        return response.choices[0].message.content.strip()
    except Exception as exc:  # pragma: no cover - best-effort call
        return f"{label} (confidence {confidence:.2f}). GenAI explanation failed: {exc}"


def explain_metrics(features: Dict[str, float]) -> str:
    client = _client()
    if not client:
        return "Metrics summary unavailable (set NETMIND_APY_KEY)."

    prompt = (
        "You are a health data summarizer. Given raw numeric metrics (e.g., resting heart rate, sleep averages), "
        "produce a concise, human-readable summary in 2-3 sentences. Mention notable highs/lows and what they may suggest about recovery, stress, or sleep quality.\n"
        f"Metrics: {features}\n"
    )
    try:
        response = client.chat.completions.create(
            model=NETMIND_MODEL,
            messages=[
                {"role": "system", "content": "Act like you are a helpful assistant."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=220,
            temperature=0.4,
        )
        return response.choices[0].message.content.strip()
    except Exception as exc:  # pragma: no cover - best-effort call
        return f"Metrics explanation failed: {exc}"
