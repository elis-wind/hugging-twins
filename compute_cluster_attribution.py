import os
import numpy as np
import json
import pandas as pd

OUT_DIR = "outputs"
HRV_FEATURE_NAMES = os.path.join(OUT_DIR, 'hrv_feature_names.json')
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


def main():
    emb_p = find_first_existing(EMB_PATHS)
    if emb_p is None:
        raise FileNotFoundError('No embeddings found in outputs/')
    emb = np.load(emb_p, allow_pickle=True)
    emb = np.asarray(emb, dtype=float)
    print('Loaded', emb_p, 'shape=', emb.shape)

    labels_path = os.path.join(OUT_DIR, 'cluster_labels_hdbscan.npy')
    if not os.path.exists(labels_path):
        raise FileNotFoundError('Cluster labels not found:', labels_path)
    labels = np.load(labels_path)
    labels = np.asarray(labels)
    print('Loaded labels shape=', labels.shape, 'unique=', np.unique(labels))

    # load HRV feature names
    hrv_names = []
    if os.path.exists(HRV_FEATURE_NAMES):
        try:
            with open(HRV_FEATURE_NAMES, 'r') as f:
                hrv_names = json.load(f)
        except Exception:
            hrv_names = []

    if hrv_names:
        hrv_count = len(hrv_names)
    else:
        # infer from hrvs in outputs if available
        hrvs_path = os.path.join(OUT_DIR, 'hrv_features.npy')
        if os.path.exists(hrvs_path):
            try:
                hrvs = np.load(hrvs_path, allow_pickle=True)
                hrv_count = hrvs.shape[1]
                # create generic names
                hrv_names = [f'hrv_{i}' for i in range(hrv_count)]
            except Exception:
                hrv_count = 0
        else:
            hrv_count = 0

    if hrv_count == 0:
        print('No HRV features available to attribute. Exiting.')
        return

    if emb.shape[1] < hrv_count:
        print('Embeddings have fewer columns than HRV features; cannot extract HRV columns')
        return

    # assume HRV features are last hrv_count columns
    hrv_matrix = emb[:, -hrv_count:]
    # handle nan
    mask_valid = np.isfinite(hrv_matrix).all(axis=1)
    if not mask_valid.all():
        print('Warning: some windows have NaNs in HRV features; they will be ignored for global stats')
    hrv_valid = hrv_matrix[mask_valid]

    global_mean = np.nanmean(hrv_valid, axis=0)
    global_std = np.nanstd(hrv_valid, axis=0, ddof=0)

    rows = []
    for lab in np.unique(labels):
        lab = int(lab)
        idxs = np.where(labels == lab)[0]
        if idxs.size == 0:
            continue
        # consider only valid rows
        valid_idxs = idxs[np.isfinite(hrv_matrix[idxs]).all(axis=1)]
        if valid_idxs.size == 0:
            # skip cluster with no valid HRV
            continue
        cluster_hrv = hrv_matrix[valid_idxs]
        cluster_mean = np.nanmean(cluster_hrv, axis=0)
        # z-score
        with np.errstate(divide='ignore', invalid='ignore'):
            z = (cluster_mean - global_mean) / global_std
        for i, name in enumerate(hrv_names):
            rows.append({
                'cluster': lab,
                'feature': name,
                'cluster_mean': float(cluster_mean[i]) if np.isfinite(cluster_mean[i]) else None,
                'global_mean': float(global_mean[i]) if np.isfinite(global_mean[i]) else None,
                'zscore': float(z[i]) if np.isfinite(z[i]) else None,
                'n_windows_in_cluster': int(idxs.size)
            })

    out_df = pd.DataFrame(rows)
    if out_df.empty:
        print('No attribution rows generated; exiting')
        return

    # rank by absolute zscore per cluster
    out_df['abs_z'] = out_df['zscore'].abs()
    out_df = out_df.sort_values(['cluster', 'abs_z'], ascending=[True, False])

    out_path = os.path.join(OUT_DIR, 'cluster_hrv_attribution.csv')
    out_df.to_csv(out_path, index=False)
    print('Saved attribution CSV to', out_path)

    # generate a compact summary per cluster (top 3 features)
    summary_rows = []
    for lab in out_df['cluster'].unique():
        sub = out_df[out_df['cluster'] == lab]
        top = sub.head(3)
        top_features = [f"{r['feature']} (z={r['zscore']:.2f})" for _, r in top.iterrows()]
        summary_rows.append({'cluster': int(lab), 'top_features': '; '.join(top_features), 'n_windows': int(sub['n_windows_in_cluster'].iloc[0])})

    summary_df = pd.DataFrame(summary_rows)
    summary_path = os.path.join(OUT_DIR, 'cluster_hrv_top_features_summary.csv')
    summary_df.to_csv(summary_path, index=False)
    print('Saved top-features summary to', summary_path)

    # if stress summary exists, join it
    stress_path = os.path.join(OUT_DIR, 'cluster_stress_summary_hdbscan.csv')
    if os.path.exists(stress_path):
        stress_df = pd.read_csv(stress_path)
        merged = summary_df.merge(stress_df, on='cluster', how='left')
        merged_path = os.path.join(OUT_DIR, 'cluster_summary_with_stress.csv')
        merged.to_csv(merged_path, index=False)
        print('Saved cluster summary merged with stress to', merged_path)


if __name__ == '__main__':
    main()
