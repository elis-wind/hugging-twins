import os
import json
import numpy as np
import pandas as pd
from Data_TSFM import load_csv, create_sliding_windows, extract_series
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
import matplotlib.pyplot as plt

try:
    import hdbscan
except Exception:
    hdbscan = None


OUT_DIR = "outputs"
HRV_CSV = "data/Données Evann/com.samsung.health.hrv.20251122092438.csv"
STRESS_CSV = "data/Données Evann/com.samsung.shealth.stress.20251122092438.csv"
HR_PATHS = [
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


def load_embeddings():
    p = find_first_existing(HR_PATHS)
    if p is None:
        raise FileNotFoundError("No embeddings file found in outputs/")
    emb = np.load(p, allow_pickle=True)
    emb = np.asarray(emb, dtype=float)
    return emb, p


def align_window_times(hrv_csv, n_windows):
    # load the HRV csv and extract start_time for each row; sliding window i corresponds to row i
    df = load_csv(hrv_csv)
    if 'start_time' not in df.columns:
        raise KeyError('start_time column not found in HRV csv')
    times = pd.to_datetime(df['start_time'])
    # ensure we have at least n_windows timestamps
    if len(times) < n_windows:
        # fallback: pad with NaT
        times = times.reindex(range(n_windows))
    return times.iloc[:n_windows].reset_index(drop=True)


def align_stress_to_windows(stress_csv, window_times):
    df = load_csv(stress_csv)
    if 'start_time' not in df.columns or 'score' not in df.columns:
        # can't align
        return None
    df['start_time'] = pd.to_datetime(df['start_time'])
    df = df.sort_values('start_time')
    windows = pd.DataFrame({'window_time': window_times})
    windows['window_time'] = pd.to_datetime(windows['window_time'])
    # use merge_asof to align each stress record to nearest past window
    df = df.sort_values('start_time')
    windows_sorted = windows.sort_values('window_time')
    # for each stress record, find nearest window index (by absolute time)
    win_times = windows_sorted['window_time'].values.astype('datetime64[ns]')
    stress_times = df['start_time'].values.astype('datetime64[ns]')
    # compute nearest index via searchsorted
    idxs = np.searchsorted(win_times, stress_times)
    # clamp
    idxs = np.clip(idxs, 0, len(win_times)-1)
    # choose the closer of idx and idx-1
    neighbors = []
    for s, i in zip(stress_times, idxs):
        i = int(i)
        cand = i
        best = i
        if i > 0:
            prev = i-1
            # compare distances
            if abs((s - win_times[prev])) < abs((s - win_times[cand])):
                best = prev
        neighbors.append(best)
    df['window_idx'] = neighbors
    return df


def summarize_clusters(labels, emb, hrv_feat_names=None):
    import csv
    os.makedirs(OUT_DIR, exist_ok=True)
    labels = np.asarray(labels)
    unique = np.unique(labels)
    rows = []
    for lab in unique:
        mask = labels == lab
        cnt = mask.sum()
        if cnt == 0:
            continue
        centroid = emb[mask].mean(axis=0)
        row = {'cluster': int(lab), 'count': int(cnt)}
        # attach HRV feature means if available (assumes last len(hrv_feat_names) columns)
        if hrv_feat_names is not None and len(hrv_feat_names) > 0 and emb.shape[1] >= len(hrv_feat_names):
            h = emb[mask][:, -len(hrv_feat_names):]
            for i, nm in enumerate(hrv_feat_names[::-1]):
                # reversed order because we slice from end
                row[f"hrv_{nm}"] = float(h.mean(axis=0)[-1-i])
        rows.append(row)

    csv_path = os.path.join(OUT_DIR, 'cluster_summary_hdbscan.csv')
    keys = sorted(rows[0].keys()) if rows else []
    with open(csv_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        for r in rows:
            writer.writerow(r)
    print('Saved cluster summary to', csv_path)


def main():
    emb, emb_path = load_embeddings()
    print('Loaded embeddings from', emb_path, 'shape=', emb.shape)

    # try to load HRV feature names
    hrv_feat_names = []
    try:
        with open(os.path.join(OUT_DIR, 'hrv_feature_names.json'), 'r') as f:
            hrv_feat_names = json.load(f)
    except Exception:
        pass

    # replace infinities with NaN so imputer can handle them
    emb = np.where(np.isfinite(emb), emb, np.nan)

    # impute missing values (median) before scaling/PCA
    imputer = SimpleImputer(strategy='median')
    emb_imputed = imputer.fit_transform(emb)

    # standardize
    scaler = StandardScaler()
    emb_scaled = scaler.fit_transform(emb_imputed)

    # dimensionality reduction for plotting
    pca = PCA(n_components=2)
    z2 = pca.fit_transform(emb_scaled)

    # run HDBSCAN (fallback to DBSCAN if unavailable)
    if hdbscan is not None:
        clusterer = hdbscan.HDBSCAN(min_cluster_size=5, metric='euclidean')
        labels = clusterer.fit_predict(emb_scaled)
    else:
        # fallback: use sklearn DBSCAN (note: different algorithm, must tune eps/min_samples)
        from sklearn.cluster import DBSCAN
        print('hdbscan not available — falling back to sklearn.DBSCAN')
        clusterer = DBSCAN(eps=1.0, min_samples=5, metric='euclidean')
        labels = clusterer.fit_predict(emb_scaled)
    print('HDBSCAN produced', len(np.unique(labels)), 'labels (including -1 for noise)')

    # save labels and plot
    np.save(os.path.join(OUT_DIR, 'cluster_labels_hdbscan.npy'), labels)
    fig, ax = plt.subplots(figsize=(8, 6))
    sc = ax.scatter(z2[:, 0], z2[:, 1], c=labels, cmap='tab10', s=20)
    ax.set_title('HDBSCAN clusters (PCA 2D)')
    plt.colorbar(sc, ax=ax, label='cluster')
    fig.tight_layout()
    plot_path = os.path.join(OUT_DIR, 'clusters_hdbscan.png')
    fig.savefig(plot_path)
    print('Saved cluster plot to', plot_path)

    # cluster summaries
    summarize_clusters(labels, emb, hrv_feat_names)

    # align windows to HRV start times and map stress records
    try:
        window_times = align_window_times(HRV_CSV, emb.shape[0])
        stress_df = align_stress_to_windows(STRESS_CSV, window_times)
        if stress_df is not None:
            # compute per-window average stress and per-cluster mean stress
            win_stress = stress_df.groupby('window_idx')['score'].mean()
            per_cluster = []
            for lab in np.unique(labels):
                idxs = np.where(labels == lab)[0]
                scores = win_stress.reindex(idxs).dropna()
                per_cluster.append({'cluster': int(lab), 'mean_stress': float(scores.mean()) if not scores.empty else None,
                                    'n_stress_points': int(scores.count())})
            stress_csv_out = os.path.join(OUT_DIR, 'cluster_stress_summary_hdbscan.csv')
            pd.DataFrame(per_cluster).to_csv(stress_csv_out, index=False)
            print('Saved per-cluster stress summary to', stress_csv_out)
    except Exception as e:
        print('Warning: could not compute stress alignment:', e)

    print('Done.')


if __name__ == '__main__':
    main()
