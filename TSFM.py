from Data_TSFM import load_csv, extract_series, normalize, create_sliding_windows, to_tensor
from dataset import TimeSeriesDataset
from model import load_model, run_inference
import torch
import numpy as np
import os
import matplotlib.pyplot as plt


def main(csv_path):
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

    # Simple inference on first batch
    x, mask = ds[0]
    x = x.unsqueeze(0)  # add batch dim
    mask = mask.unsqueeze(0)

    preds, hidden = run_inference(model, x, past_observed_mask=mask, pad_to=512, return_hidden_states=True)

    # Print shapes and basic info
    print("preds:", type(preds), getattr(preds, 'shape', None))
    if hidden is not None:
        try:
            print("hidden states: type=", type(hidden), "len=", len(hidden))
        except Exception:
            print("hidden states: ", hidden)

    # Save outputs to disk for later clustering/analysis
    out_dir = "outputs"
    os.makedirs(out_dir, exist_ok=True)
    if preds is not None:
        try:
            preds_np = preds.detach().cpu().numpy()
        except Exception:
            preds_np = np.array(preds)
        np.save(os.path.join(out_dir, "preds.npy"), preds_np)
        print(f"Saved predictions to {os.path.join(out_dir, 'preds.npy')}")

    # Try to collapse hidden states into a single embedding per sample
    emb_path = os.path.join(out_dir, "embeddings.npy")
    if hidden is not None:
        # Hidden can be a nested tuple/list of tensors. Collect candidate arrays.
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

        arrays = _collect_arrays(hidden)
        emb = None
        # diagnostics
        print("Collected hidden arrays (count=", len(arrays), ")")
        for i, a in enumerate(arrays):
            try:
                print(f"  array[{i}] shape={getattr(a, 'shape', None)} dtype={getattr(a, 'dtype', None)}")
            except Exception:
                print(f"  array[{i}] (non-array)")

        # prefer arrays with ndim >= 2: pool non-feature axes to get (batch, dim)
        cand_nd = [a for a in arrays if isinstance(a, np.ndarray) and a.ndim >= 2]
        if cand_nd:
            # find candidate with largest last-dim (feature dim)
            best = max(cand_nd, key=lambda a: a.shape[-1])
            # if best has shape (batch, ..., dim) collapse axes 1..-2 by nanmean to ignore NaNs
            if best.ndim >= 3:
                mean_axes = tuple(range(1, best.ndim - 1))
                emb = np.nanmean(best, axis=mean_axes)
            elif best.ndim == 2:
                emb = best
        else:
            emb = None

        # If embeddings contain NaNs, try to fill column-wise with nanmean; if columns are all-NaN, fill with 0
        if emb is not None:
            # save raw hidden for debugging as well
            try:
                hidden_np = tuple(h.detach().cpu().numpy() if isinstance(h, torch.Tensor) else h for h in hidden)
                np.save(os.path.join(out_dir, "hidden_raw.npy"), hidden_np)
            except Exception:
                np.save(os.path.join(out_dir, "hidden_raw.npy"), np.array(hidden, dtype=object))

            if np.isnan(emb).any():
                print('Embeddings contain NaNs; attempting column-wise imputation using nanmean')
                col_mean = np.nanmean(emb, axis=0)
                # where column mean is nan (all values nan), replace with 0
                col_mean = np.where(np.isnan(col_mean), 0.0, col_mean)
                # broadcast and fill
                emb = np.where(np.isnan(emb), col_mean.reshape((1, -1)), emb)

            np.save(emb_path, emb)
            print(f"Saved embeddings to {emb_path} (shape={emb.shape})")
        else:
            print("Could not form embeddings from hidden states; saved raw hidden object instead.")
            # detach each tensor in the tuple and move to CPU where possible
            try:
                hidden_np = tuple(h.detach().cpu().numpy() if isinstance(h, torch.Tensor) else h for h in hidden)
                np.save(os.path.join(out_dir, "hidden_raw.npy"), hidden_np)
            except Exception:
                # last resort: save with pickle via numpy (object)
                np.save(os.path.join(out_dir, "hidden_raw.npy"), np.array(hidden, dtype=object))

    # Quick plot: last input window (unpadded) vs predicted horizon for the first sample
    try:
        sample_x = x[0].detach().cpu().numpy()
        # if channels dim exists, squeeze last dim
        if sample_x.ndim == 2 and sample_x.shape[1] == 1:
            sample_x = sample_x.squeeze(1)
        else:
            sample_x = sample_x.reshape(-1)

        # find non-zero part of mask to get original unpadded length
        m = mask[0].detach().cpu().numpy()
        # collapse channel dim if present
        if m.ndim == 2:
            m_sum = m.sum(axis=1)
        elif m.ndim == 1:
            m_sum = m
        elif m.ndim == 3:
            m_sum = m.sum(axis=(1, 2))
        else:
            m_sum = m.reshape(-1)

        real_idx = np.where(m_sum > 0)[0]
        if real_idx.size > 0:
            # take the observed region
            seq = sample_x[real_idx[0]: real_idx[-1] + 1]
        else:
            seq = sample_x

        fig, ax = plt.subplots(figsize=(8, 3))
        ax.plot(range(len(seq)), seq, label="input (last window)")
        if preds is not None:
            p = preds.detach().cpu().numpy()
            # prediction shape may be [batch, horizon, channels] or similar
            if p.ndim == 3:
                p0 = p[0, :, 0]
            elif p.ndim == 2:
                p0 = p[0]
            else:
                p0 = p
            ax.plot(range(len(seq), len(seq) + len(p0)), p0, label="predicted horizon")
        ax.legend()
        ax.set_title("Input window and predicted horizon (sample 0)")
        plt.tight_layout()
        plot_path = os.path.join(out_dir, "example_prediction.png")
        fig.savefig(plot_path)
        print(f"Saved plot to {plot_path}")
    except Exception as e:
        print("Plotting failed:", e)

if __name__ == "__main__":
    csv_path = "data/com.samsung.health.hrv.20251122092438.csv"
    main(csv_path)