import os
import csv
import numpy as np
import pandas as pd
from datetime import datetime

OUT_DIR = "outputs"
HR_CSV = "data/Données Evann/com.samsung.shealth.tracker.heart_rate.20251122092438.csv"
HRV_CSV = "data/Données Evann/com.samsung.health.hrv.20251122092438.csv"
EMB_PATHS = [
    os.path.join(OUT_DIR, p) for p in [
        "embeddings_with_hrv.npy",
        "embeddings_combined.npy",
        "embeddings_all.npy",
        "embeddings.npy",
    ]
]


def find_first_existing(paths):
    for p in paths:
        if os.path.exists(p):
            return p
    return None


def load_clean_hr(csv_path):
    # robust CSV read: skip first metadata line, read header, handle trailing commas
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        # skip metadata
        try:
            next(reader)
        except StopIteration:
            return pd.DataFrame()
        # header
        header = next(reader)
        header = [h.strip() for h in header]
        rows = []
        for row in reader:
            # pad row if short
            if len(row) < len(header):
                row = row + [""] * (len(header) - len(row))
            rows.append(row[:len(header)])
    df = pd.DataFrame(rows, columns=header)
    # strip spaces
    for c in df.columns:
        if df[c].dtype == object:
            df[c] = df[c].str.strip()
    return df


def align_windows(hrv_csv):
    # robustly load HRV CSV and detect start_time column
    try:
        # prefer project loader that handles metadata lines
        from Data_TSFM import load_csv
        df = load_csv(hrv_csv)
    except Exception:
        # fallback: use pandas and skip first metadata line
        df = pd.read_csv(hrv_csv, skiprows=1, header=0, encoding='utf-8', on_bad_lines='warn')

    # detect start_time-like column
    time_col = None
    for c in df.columns:
        if 'start_time' in c:
            time_col = c
            break
    if time_col is None:
        # no usable time column found
        return pd.Series(dtype='datetime64[ns]')

    times = pd.to_datetime(df[time_col], errors='coerce')
    return times.reset_index(drop=True)


def main():
    emb_p = find_first_existing(EMB_PATHS)
    if emb_p is None:
        raise FileNotFoundError('No embeddings found in outputs/')
    emb = np.load(emb_p, allow_pickle=True)
    emb = np.asarray(emb, dtype=float)
    print('Loaded', emb_p, 'shape=', emb.shape)

    # load heart rate raw
    hr_df = load_clean_hr(HR_CSV)
    if hr_df.empty:
        print('Could not load heart rate CSV')
        return

    # find columns
    time_col = None
    hr_col = None
    for c in hr_df.columns:
        if 'start_time' in c:
            time_col = c
        if 'heart_rate' in c and c.endswith('heart_rate'):
            hr_col = c
    if time_col is None or hr_col is None:
        print('Could not find heart rate or start_time columns in HR CSV. Columns:', hr_df.columns.tolist())
        return

    # parse
    hr_df[time_col] = pd.to_datetime(hr_df[time_col], errors='coerce')
    hr_df[hr_col] = pd.to_numeric(hr_df[hr_col], errors='coerce')
    hr_df = hr_df.dropna(subset=[time_col, hr_col])
    if hr_df.empty:
        print('No valid heart rate rows after parsing')
        return

    # align to HRV windows
    hrv_times = align_windows(HRV_CSV)
    if len(hrv_times) == 0:
        print('Could not load HRV times')
        return

    win_times = hrv_times.values.astype('datetime64[ns]')
    hr_times = hr_df[time_col].values.astype('datetime64[ns]')
    idxs = np.searchsorted(win_times, hr_times)
    idxs = np.clip(idxs, 0, len(win_times)-1)
    neighbors = []
    for s, i in zip(hr_times, idxs):
        i = int(i)
        cand = i
        best = i
        if i > 0:
            prev = i-1
            if abs((s - win_times[prev])) < abs((s - win_times[cand])):
                best = prev
        neighbors.append(best)
    hr_df['window_idx'] = neighbors

    # compute mean HR per window
    win_mean = hr_df.groupby('window_idx')[hr_col].mean()

    # create hr vector aligned to emb length
    n = emb.shape[0]
    hr_per_win = np.full((n, 1), np.nan)
    for idx, val in win_mean.items():
        if 0 <= idx < n:
            hr_per_win[int(idx), 0] = float(val)

    # append to embeddings as last column
    emb_new = np.hstack([emb, hr_per_win])
    out_path = os.path.join(OUT_DIR, 'embeddings_with_hrv.npy')
    np.save(out_path, emb_new)
    print('Saved new embeddings with heart rate to', out_path, 'shape=', emb_new.shape)


if __name__ == '__main__':
    main()
