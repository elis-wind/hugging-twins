import numpy as np
import os

OUT_DIR = "outputs"
hidden_path = os.path.join(OUT_DIR, "hidden_raw.npy")
emb_path = os.path.join(OUT_DIR, "embeddings_fixed.npy")

if not os.path.exists(hidden_path):
    print("hidden_raw.npy not found in outputs/. Run TSFM.py first or ensure hidden_raw.npy exists.")
    raise SystemExit(1)

hidden = np.load(hidden_path, allow_pickle=True)
# hidden may be a tuple of arrays; collect numpy arrays
arrays = []

def collect(h):
    if isinstance(h, np.ndarray):
        arrays.append(h)
    elif isinstance(h, (list, tuple)):
        for x in h:
            collect(x)
    else:
        try:
            a = np.array(h)
            arrays.append(a)
        except Exception:
            pass

collect(hidden)
print(f"Collected {len(arrays)} arrays from hidden_raw.npy")
if not arrays:
    print("No numeric arrays found in hidden_raw.npy")
    raise SystemExit(1)

cand_nd = [a for a in arrays if isinstance(a, np.ndarray) and a.ndim >= 2]
if not cand_nd:
    print("No candidate arrays with ndim>=2 found")
    raise SystemExit(1)

best = max(cand_nd, key=lambda a: a.shape[-1])
print("best array shape", best.shape)

if best.ndim >= 3:
    mean_axes = tuple(range(1, best.ndim - 1))
    emb = np.nanmean(best, axis=mean_axes)
elif best.ndim == 2:
    emb = best

# fix NaNs
if np.isnan(emb).any():
    col_mean = np.nanmean(emb, axis=0)
    col_mean = np.where(np.isnan(col_mean), 0.0, col_mean)
    emb = np.where(np.isnan(emb), col_mean.reshape((1, -1)), emb)

np.save(emb_path, emb)
print(f"Saved fixed embeddings to {emb_path} with shape {emb.shape}")
