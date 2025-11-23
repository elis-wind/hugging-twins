# times = times[mask]

import pandas as pd
import matplotlib.pyplot as plt
import sys

CSV_PATH = "data/Données Evann/com.samsung.shealth.tracker.heart_rate.20251122092438.csv"

# Try to robustly load CSV, skipping metadata/header lines
def robust_read_csv(path):
	# Try to robustly load CSV, skipping metadata/header lines
	# Always skip the first line (metadata) and use the second line as header
	df = pd.read_csv(path, skiprows=1, header=0, encoding="utf-8")
	# Strip whitespace from column names and values
	df.columns = df.columns.str.strip()
	for col in df.columns:
		if df[col].dtype == object:
			df[col] = df[col].str.strip()
	print("First 5 rows after loading and cleaning:")
	print(df.head())
	return df

df = robust_read_csv(CSV_PATH)

# Auto-detect heart rate and timestamp columns robustly
def detect_columns(df):
	# detect time column: column with most parseable datetimes
	time_scores = {}
	for col in df.columns:
		try:
			parsed = pd.to_datetime(df[col], errors='coerce')
			time_scores[col] = parsed.notna().sum()
		except Exception:
			time_scores[col] = 0
	time_col = max(time_scores, key=time_scores.get)
	if time_scores[time_col] == 0:
		time_col = None

	# detect heart rate column: numeric column with values in plausible BPM range
	hr_scores = {}
	for col in df.columns:
		num = pd.to_numeric(df[col], errors='coerce')
		# count values within plausible heart-rate range
		hr_scores[col] = ((num >= 30) & (num <= 220)).sum()
	hr_col = max(hr_scores, key=hr_scores.get)
	if hr_scores[hr_col] == 0:
		hr_col = None

	return hr_col, time_col


hr_col, time_col = detect_columns(df)
print('Auto-detected columns -> hr_col:', hr_col, 'time_col:', time_col)
if hr_col is None or time_col is None:
	print("Could not find heart rate or start_time column.")
	print("Available columns:", list(df.columns))
	sys.exit(1)

hr = pd.to_numeric(df[hr_col], errors="coerce")
times = pd.to_datetime(df[time_col], errors="coerce")

# Drop NaNs
mask = hr.notna() & times.notna()
hr = hr[mask]
times = times[mask]


if hr.empty or times.empty:
	print("No valid heart rate or timestamp data found.")
	print(f"Sample raw heart rate values from column '{hr_col}':", df[hr_col].head(10).tolist())
	print(f"Sample raw timestamp values from column '{time_col}':", df[time_col].head(10).tolist())
	print("If you see blanks, strange formats, or unexpected values, check your CSV for extra header lines, encoding issues, or column name mismatches.")
	sys.exit(1)

# Plot heart rate over time
plt.figure(figsize=(12,4))
plt.plot(times, hr, marker='.', linestyle='-', alpha=0.7)
plt.title("Heart Rate Over Time")
plt.xlabel("Time")
plt.ylabel("Heart Rate (BPM)")
plt.tight_layout()
plt.savefig("outputs/heart_rate_timeseries.png")
plt.close()

# Save cleaned heart rate data
out_df = pd.DataFrame({"timestamp": times, "heart_rate": hr})
out_df.to_csv("outputs/heart_rate_cleaned.csv", index=False)
print("Saved outputs/heart_rate_timeseries.png and outputs/heart_rate_cleaned.csv")
