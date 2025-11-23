from torch.utils.data import Dataset
import torch

class TimeSeriesDataset(Dataset):
    def __init__(self, windows, device=None, pad_to=None):
        """
        windows: numpy array [n_windows, lookback] OR tensor [n, seq_len, channels]
        pad_to: if provided, pad sequence length (second dim) on the left to pad_to
        """
        if isinstance(windows, torch.Tensor):
            self.data = windows
        else:
            self.data = torch.tensor(windows, dtype=torch.float32).unsqueeze(2)  # add channel

        self.device = device
        self.pad_to = pad_to

    def __len__(self):
        return self.data.shape[0]

    def __getitem__(self, idx):
        x = self.data[idx]  # [seq_len, channels]
        if self.pad_to is not None and x.shape[0] < self.pad_to:
            pad_len = self.pad_to - x.shape[0]
            pad = torch.zeros((pad_len, x.shape[1]), dtype=x.dtype)
            x = torch.cat([pad, x], dim=0)
        if self.device:
            x = x.to(self.device)
        # Build observed mask: ones for real timesteps, zeros for padded timesteps
        if self.pad_to is not None:
            mask = torch.cat([torch.zeros(pad_len, x.shape[1]), torch.ones(x.shape[0]-pad_len, x.shape[1])], dim=0)
        else:
            mask = torch.ones_like(x)
        return x, mask