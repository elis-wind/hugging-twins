from Data_TSFM import load_csv, extract_series, normalize, create_sliding_windows, to_tensor
from dataset import TimeSeriesDataset
from model import load_model, run_inference
import torch
import numpy as np
import os
import sys


def _collect_arrays(h):
    arrs = []
    if isinstance(h, torch.Tensor):
        arrs.append(h.detach().cpu().numpy())
    elif isinstance(h, (list, tuple)):
        for x in h:
            arrs.extend(_collect_arrays(x))
    else:
        try:
            a = np.array(h)
            arrs.append(a)
        except Exception:
            pass
    return arrs


def collapse_hidden_to_embedding(hidden):
    """Return (n_features,) embedding for a single-sample hidden state object.
    Uses nan-aware mean pooling across non-feature axes and column-wise imputation.
    Returns None if no suitable array found.
    """
    arrays = _collect_arrays(hidden)
    cand_nd = [a for a in arrays if isinstance(a, np.ndarray) and a.ndim >= 2]
    if not cand_nd:
        return None
    # choose candidate with largest last-dim
    best = max(cand_nd, key=lambda a: a.shape[-1])
    if best.ndim >= 3:
        mean_axes = tuple(range(1, best.ndim - 1))
        emb = np.nanmean(best, axis=mean_axes)
    elif best.ndim == 2:
        emb = best
    else:
        return None

    # emb should now be (batch, dim) or (dim,) -- for our use batch dim==1
    if emb.ndim == 2 and emb.shape[0] == 1:
        emb = emb.reshape(-1)

    if np.isnan(emb).any():
        col_mean = np.nanmean(emb, axis=0)
        if np.isnan(col_mean).all():
            col_mean = np.zeros_like(col_mean)
        col_mean = np.where(np.isnan(col_mean), 0.0, col_mean)
        # emb is 1d
        emb = np.where(np.isnan(emb), col_mean, emb)

    return emb


def main(csv_path=None):
    if csv_path is None:
        csv_path = "data/com.samsung.health.hrv.20251122092438.csv"
    df = load_csv(csv_path)
    series = extract_series(df, 'binning_data')
    series_norm, mean, std = normalize(series)
    windows = create_sliding_windows(series_norm, lookback=96, horizon=24)
    if windows.size == 0:
        print("Not enough data for the chosen lookback/horizon")
        return
    tensor_windows = to_tensor(windows)  # [n, seq_len, 1]
    ds = TimeSeriesDataset(tensor_windows, pad_to=512)
    model = load_model()

    out_dir = "outputs"
    os.makedirs(out_dir, exist_ok=True)

    preds_list = []
    emb_list = []
    hidden_list = []

    n = len(ds)
    print(f"Running inference on {n} windows...")
    for i in range(n):
        try:
            x, mask = ds[i]
            x = x.unsqueeze(0)
            mask = mask.unsqueeze(0)
            preds, hidden = run_inference(model, x, past_observed_mask=mask, pad_to=512, return_hidden_states=True)

            # preds to numpy: take first sample
            try:
                p_np = preds.detach().cpu().numpy()[0]
            except Exception:
                p_np = np.array(preds)[0]
            preds_list.append(p_np)

            # collapse hidden to embedding
            emb = collapse_hidden_to_embedding(hidden)
            if emb is None:
                # fallback: form embedding from prediction mean
                emb = p_np.mean(axis=0) if p_np.ndim > 0 else np.array([p_np])
            emb_list.append(emb)

            # save raw hidden for debugging per-sample (as object)
            try:
                hidden_np = tuple(h.detach().cpu().numpy() if isinstance(h, torch.Tensor) else h for h in hidden)
            except Exception:
                hidden_np = np.array(hidden, dtype=object)
            hidden_list.append(hidden_np)

            if (i + 1) % 20 == 0 or (i + 1) == n:
                print(f"Processed {i+1}/{n}")

        except Exception as e:
            print(f"Failed sample {i}:", e)
            # append placeholders to keep indices aligned
            preds_list.append(np.full((24,), np.nan))
            emb_list.append(np.full((128,), np.nan))
            hidden_list.append(None)

    preds_all = np.stack(preds_list, axis=0)
    emb_all = np.vstack([e.reshape(1, -1) for e in emb_list])

    np.save(os.path.join(out_dir, 'preds_all.npy'), preds_all)
    np.save(os.path.join(out_dir, 'embeddings_all.npy'), emb_all)
    np.save(os.path.join(out_dir, 'hidden_raw_all.npy'), np.array(hidden_list, dtype=object))

    print('Saved preds_all.npy, embeddings_all.npy, hidden_raw_all.npy')

    # Also write a compatibility copy to embeddings.npy/preds.npy for cluster scripts
    try:
        np.save(os.path.join(out_dir, 'embeddings.npy'), emb_all)
        np.save(os.path.join(out_dir, 'preds.npy'), preds_all)
        print('Saved compatibility files embeddings.npy and preds.npy')
    except Exception:
        pass


if __name__ == '__main__':
    main(*sys.argv[1:])
