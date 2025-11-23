import os
import json
import numpy as np
from Data_TSFM import load_csv, extract_series, create_sliding_windows


def rmssd(x):
    d = np.diff(x)
    return np.sqrt(np.mean(d ** 2)) if d.size > 0 else 0.0


def sdnn(x):
    return float(np.std(x, ddof=0)) if x.size > 0 else 0.0


def pnn50(x, threshold=50.0):
    # percent of successive diffs exceeding threshold
    d = np.abs(np.diff(x))
    if d.size == 0:
        return 0.0
    return float((d > threshold).sum()) / float(d.size)


def compute_features_for_windows(windows):
    # windows: np.ndarray shape (n_windows, lookback)
    feats = []
    for w in windows:
        w = np.asarray(w).astype(float)
        feats.append([
            float(np.nanmean(w)),
            float(np.nanmedian(w)),
            float(np.nanmin(w)),
            float(np.nanmax(w)),
            rmssd(w),
            sdnn(w),
            pnn50(w)
        ])
    return np.vstack(feats) if feats else np.empty((0, 7), dtype=float)


def main(csv_path=None, out_dir='outputs'):
    if csv_path is None:
        csv_path = 'data/com.samsung.health.hrv.20251122092438.csv'
    os.makedirs(out_dir, exist_ok=True)

    # load raw series and windows
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f'CSV not found at {csv_path}')
    df = load_csv(csv_path)
    series = extract_series(df, 'binning_data')
    windows = create_sliding_windows(series, lookback=96, horizon=24)
    if windows.size == 0:
        raise SystemExit('No sliding windows could be created from the CSV')

    feats = compute_features_for_windows(windows)
    feat_names = ['mean', 'median', 'min', 'max', 'rmssd', 'sdnn', 'pnn50']
    np.save(os.path.join(out_dir, 'hrv_features.npy'), feats)
    with open(os.path.join(out_dir, 'hrv_feature_names.json'), 'w') as f:
        json.dump(feat_names, f)
    print(f'Saved HRV features shape={feats.shape} to {out_dir}/hrv_features.npy')

    # load embeddings (prefer embeddings_all.npy, then embeddings.npy)
    emb_path_candidates = ['embeddings_all.npy', 'embeddings.npy']
    emb = None
    for p in emb_path_candidates:
        full = os.path.join(out_dir, p)
        if os.path.exists(full):
            emb = np.load(full, allow_pickle=True)
            print('Loaded embeddings from', full)
            break

    if emb is None:
        raise FileNotFoundError('No embeddings file found in outputs/ (looked for embeddings_all.npy, embeddings.npy)')

    # ensure shapes align
    if emb.shape[0] != feats.shape[0]:
        print('Warning: number of embeddings', emb.shape[0], '!= number of windows/features', feats.shape[0])
        # try to align by taking min
        n = min(emb.shape[0], feats.shape[0])
        emb = emb[:n]
        feats = feats[:n]

    # impute NaNs in embeddings columns with column mean
    emb = np.asarray(emb, dtype=float)
    if np.isnan(emb).any():
        col_mean = np.nanmean(emb, axis=0)
        col_mean = np.where(np.isnan(col_mean), 0.0, col_mean)
        inds = np.where(np.isnan(emb))
        emb[inds] = np.take(col_mean, inds[1])

    combined = np.hstack([emb, feats])
    np.save(os.path.join(out_dir, 'embeddings_with_hrv.npy'), combined)
    # also write compatibility files
    try:
        np.save(os.path.join(out_dir, 'embeddings_combined.npy'), combined)
        print('Saved combined embeddings to', os.path.join(out_dir, 'embeddings_with_hrv.npy'))
    except Exception:
        pass

    print('Done. Combined shape =', combined.shape)


if __name__ == '__main__':
    main()
