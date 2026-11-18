"""
Time-Series Demand & Review Volume Forecasting:
- Aggregates daily/weekly review demand
- Exponential Smoothing & Autoregressive trend models
- 30-day and 90-day future horizon projections with confidence intervals
"""

from typing import Dict, Tuple
import numpy as np
import pandas as pd


def prepare_time_series(df: pd.DataFrame, freq: str = 'W') -> pd.DataFrame:
    """Aggregate review volume and average sentiment rating by weekly or monthly intervals."""
    if 'datetime' not in df.columns:
        raise ValueError("DataFrame must contain 'datetime' column.")

    valid_df = df.dropna(subset=['datetime']).copy()
    valid_df = valid_df.set_index('datetime').sort_index()

    ts = valid_df.resample(freq).agg(
        review_count=('asin', 'count'),
        avg_rating=('rating', 'mean')
    ).fillna(0)

    # Filter out empty leading period if needed
    ts = ts[ts['review_count'] > 0]
    return ts


def forecast_demand(
    ts: pd.DataFrame,
    horizon_periods: int = 12,
    alpha: float = 0.3
) -> pd.DataFrame:
    """
    Produce forecast for the next N periods using Holt's Linear Trend / Exponential Smoothing.
    
    Returns:
    - DataFrame with historical values and forecasted future steps with lower/upper bands.
    """
    series = ts['review_count'].values.astype(float)
    if len(series) < 10:
        raise ValueError("Time series too short for forecasting.")

    # Simple Exponential Smoothing with trend (Holt's Linear)
    level = series[0]
    trend = series[1] - series[0]
    beta = 0.1

    fitted = []
    for val in series:
        last_level = level
        level = alpha * val + (1 - alpha) * (level + trend)
        trend = beta * (level - last_level) + (1 - beta) * trend
        fitted.append(level + trend)

    # Forecast future
    forecast_vals = []
    for h in range(1, horizon_periods + 1):
        forecast_vals.append(max(0, level + h * trend))

    last_date = ts.index[-1]
    freq = ts.index.freq or 'W'
    future_dates = pd.date_range(start=last_date + pd.Timedelta(days=7), periods=horizon_periods, freq=freq)

    # Standard deviation of residuals for confidence band
    residuals = series - np.array(fitted)
    residual_std = np.std(residuals)

    future_df = pd.DataFrame({
        'forecast': np.round(forecast_vals, 1),
        'lower_bound': np.maximum(0, np.round(np.array(forecast_vals) - 1.96 * residual_std, 1)),
        'upper_bound': np.round(np.array(forecast_vals) + 1.96 * residual_std, 1)
    }, index=future_dates)

    return future_df

