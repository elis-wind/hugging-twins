import numpy as np
import os
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt


def load_embeddings(out_dir="outputs"):
    emb_path = os.path.join(out_dir, "embeddings.npy")
    if os.path.exists(emb_path):
        return np.load(emb_path)
    # fallback: try preds -> collapse
    preds_path = os.path.join(out_dir, "preds.npy")
    if os.path.exists(preds_path):
        p = np.load(preds_path)
        # collapse horizon x channels -> vector
        if p.ndim == 3:
            return p.mean(axis=1)
        elif p.ndim == 2:
            return p
    raise FileNotFoundError("No embeddings or preds found in outputs/")


def cluster_and_plot(n_clusters=3, out_dir="outputs"):
    emb = load_embeddings(out_dir)
    print("Loaded embeddings shape:", emb.shape)

    # PCA to 2D for plotting
    pca = PCA(n_components=2)
    z = pca.fit_transform(emb)

    kmeans = KMeans(n_clusters=n_clusters, random_state=0)
    labels = kmeans.fit_predict(emb)

    fig, ax = plt.subplots(figsize=(6, 5))
    scatter = ax.scatter(z[:, 0], z[:, 1], c=labels, cmap="tab10", s=30)
    ax.set_title(f"KMeans (k={n_clusters}) on embeddings")
    ax.set_xlabel("PC1")
    ax.set_ylabel("PC2")
    plt.colorbar(scatter, ax=ax, label="cluster")
    plot_path = os.path.join(out_dir, f"clusters_k{n_clusters}.png")
    fig.tight_layout()
    fig.savefig(plot_path)
    print(f"Saved cluster plot to {plot_path}")

    # save labels
    np.save(os.path.join(out_dir, f"cluster_labels_k{n_clusters}.npy"), labels)
    print(f"Saved labels to {os.path.join(out_dir, f'cluster_labels_k{n_clusters}.npy')}")


if __name__ == "__main__":
    cluster_and_plot(n_clusters=3)
