from transformers import PatchTSTForPrediction, PatchTSTConfig
import torch


def load_model(model_name="ibm-granite/granite-timeseries-patchtst", device=None):
    """Load a PatchTSTForPrediction model but ensure the config matches our input channels.

    By default the pre-trained model may expect multiple input channels; we force
    `num_input_channels=1` for single-series HRV input.
    """
    # load config and set single input channel (safest when your data is univariate)
    try:
        config = PatchTSTConfig.from_pretrained(model_name)
        config.num_input_channels = 1
        model = PatchTSTForPrediction.from_pretrained(model_name, config=config)
    except Exception:
        # fallback: try to load model directly
        model = PatchTSTForPrediction.from_pretrained(model_name)

    if device:
        model = model.to(device)
    model.eval()
    return model


def run_inference(model, past_values, past_observed_mask=None, pad_to=512, device=None, return_hidden_states=False):
    """
    Run inference and optionally return encoder hidden states (useful as embeddings for clustering).

    Returns:
      - predictions: tensor (model.prediction_outputs)
      - hidden_states: (optional) tuple/list of hidden states or None

    past_values: tensor [batch, seq_len, channels]
    past_observed_mask: tensor same shape or None
    pad_to: pad left to this length (pretraining length)
    return_hidden_states: whether to request output_hidden_states from the model
    """
    b, seq_len, ch = past_values.shape
    if seq_len < pad_to:
        pad_len = pad_to - seq_len
        pad = torch.zeros((b, pad_len, ch), dtype=past_values.dtype, device=past_values.device)
        past_values_padded = torch.cat([pad, past_values], dim=1)
        if past_observed_mask is None:
            mask = torch.cat([
                torch.zeros((b, pad_len, ch), dtype=past_values.dtype, device=past_values.device),
                torch.ones_like(past_values)], dim=1)
        else:
            mask = torch.cat([
                torch.zeros((b, pad_len, ch), dtype=past_observed_mask.dtype, device=past_observed_mask.device),
                past_observed_mask], dim=1)
    else:
        past_values_padded = past_values
        mask = past_observed_mask if past_observed_mask is not None else torch.ones_like(past_values)

    call_kwargs = dict(
        past_values=past_values_padded,
        past_observed_mask=mask,
        return_dict=True,
    )
    if return_hidden_states:
        call_kwargs["output_hidden_states"] = True

    outputs = model(**call_kwargs)

    preds = getattr(outputs, "prediction_outputs", None)
    # try to get encoder hidden states or generic hidden_states
    hidden = None
    if return_hidden_states:
        hidden = getattr(outputs, "encoder_hidden_states", None) or getattr(outputs, "hidden_states", None)

    return preds, hidden