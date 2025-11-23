import pandas as pd
import numpy as np
import torch
import warnings
from io import StringIO

def load_csv(path):
    """
    Loads a CSV where the first line is extra metadata, not the header.
    Handles trailing commas, fills empty fields, strips column names.
    """
    cleaned_lines = []
    with open(path, 'r', encoding='utf-8-sig') as f:
        for i, line in enumerate(f, start=1):
            line_clean = line.rstrip('\n').rstrip(',')
            cleaned_lines.append(line_clean + '\n')
    
    # Skip the first line (extra metadata)
    cleaned_csv = StringIO(''.join(cleaned_lines[1:]))  # skip line 0
    
    try:
        df = pd.read_csv(cleaned_csv)
    except pd.errors.ParserError as e:
        warnings.warn(f"ParserError: {e}")
        df = pd.read_csv(cleaned_csv, on_bad_lines='warn')
    
    # Strip whitespace from column names
    df.columns = df.columns.str.strip()
    
    return df


def extract_series(df, col='binning_data'):
    if col not in df.columns:
        raise KeyError(f"column '{col}' not found in dataframe")
    series = pd.to_numeric(df[col], errors='coerce').to_numpy(dtype=np.float32)
    # drop or interpolate NaNs — here we forward-fill then back-fill as simple strategy
    mask = np.isfinite(series)
    if not mask.all():
        series = pd.Series(series).ffill().bfill().to_numpy(dtype=np.float32)
    return series

def normalize(series, method='standard', mean=None, std=None):
    if method == 'standard':
        if mean is None: mean = series.mean()
        if std is None: std = series.std() if series.std() != 0 else 1.0
        return (series - mean) / std, mean, std
    elif method == 'minmax':
        mn = series.min() if mean is None else mean
        mx = series.max() if std is None else std
        denom = (mx - mn) if (mx - mn) != 0 else 1.0
        return (series - mn) / denom, mn, mx
    else:
        raise ValueError("unknown normalization method")

def create_sliding_windows(series, lookback=96, horizon=24, stride=1):
    n = len(series)
    max_start = n - lookback - horizon + 1
    if max_start <= 0:
        return np.empty((0, lookback), dtype=series.dtype)
    windows = []
    for i in range(0, max_start, stride):
        windows.append(series[i:i+lookback])
    return np.stack(windows, axis=0)  # shape [n_windows, lookback]

def to_tensor(windows, add_channel=True, device=None):
    t = torch.tensor(windows, dtype=torch.float32)
    if add_channel:
        t = t.unsqueeze(2)  # [batch, seq_len, channels=1]
    if device:
        t = t.to(device)
    return t