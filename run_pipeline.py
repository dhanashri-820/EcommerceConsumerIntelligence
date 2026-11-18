"""
Single-Command End-to-End Pipeline
Executes data loading, cleaning, RFM segmentation, churn modeling, and forecasting.
Saves all figures, metrics, and models.
"""

from pathlib import Path
import json
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np

# Internal imports
from src.data_processing import load_dataset, clean_review_data, summarize_dataset
from src.customer_analytics import compute_rfm_segments, compute_cohort_retention, compute_market_basket
from src.churn_model import build_churn_features, train_churn_models
from src.forecasting import prepare_time_series, forecast_demand


def run_pipeline():
    print("=" * 70)
    print("[START] Starting EcommerceConsumerIntelligence Analytics Pipeline")
    print("=" * 70)

    project_root = Path(__file__).resolve().parent
    data_dir = project_root / "data" / "processed"
    reports_dir = project_root / "reports" / "figures"
    reports_dir.mkdir(parents=True, exist_ok=True)

    primary_data = data_dir / "home_kitchen_balanced.csv"
    if not primary_data.exists():
        raise FileNotFoundError(f"Missing primary dataset: {primary_data}")

    # 1. Load and Clean
    print("\n[Step 1/5] Loading & Cleaning Dataset...")
    raw_df = load_dataset(primary_data)
    df = clean_review_data(raw_df)
    summary = summarize_dataset(df)
    print("  SUCCESS: Processed " + str(summary['total_reviews']) + " reviews.")

    # 2. RFM & K-Means Customer Segmentation
    print("\n[Step 2/5] Running Customer Segmentation (RFM + K-Means)...")
    user_rfm, profiles = compute_rfm_segments(df, n_clusters=4, random_state=42)
    print("  Segments identified:")
    for cid, prof in profiles.items():
        print(f"   - Cluster {cid} [{prof['persona']}]: {prof['avg_frequency']}, {prof['avg_rating']}")

    # Save RFM figure
    plt.figure(figsize=(8, 5))
    sns.scatterplot(
        data=user_rfm,
        x='recency_days',
        y='frequency',
        hue='segment_name',
        palette='tab10',
        alpha=0.7
    )
    plt.yscale('log')
    plt.title('Customer Segments: Recency vs. Frequency (Log Scale)')
    plt.xlabel('Recency (Days)')
    plt.ylabel('Frequency (Reviews count)')
    plt.tight_layout()
    plt.savefig(reports_dir / "customer_segments_rfm.png", dpi=300)
    plt.close()

    # 3. Cohort Retention Matrix
    print("\n[Step 3/5] Calculating Activity Cohort Retention...")
    cohort_matrix = compute_cohort_retention(df, freq='Q')
    plt.figure(figsize=(10, 6))
    sns.heatmap(cohort_matrix.iloc[-8:, :6], annot=True, fmt='.1f', cmap='Blues', cbar=True)
    plt.title('Quarterly Customer Retention Heatmap (%)')
    plt.xlabel('Quarters Since First Purchase/Review')
    plt.ylabel('First Review Cohort')
    plt.tight_layout()
    plt.savefig(reports_dir / "cohort_retention_heatmap.png", dpi=300)
    plt.close()
    print("  Saved cohort retention heatmap to reports/figures/")

    # 4. Churn Prediction (Baseline vs. Random Forest)
    print("\n[Step 4/5] Training Churn Prediction Models (Baseline vs. Enhanced)...")
    churn_df = build_churn_features(df, inactivity_days_threshold=730)
    churn_results = train_churn_models(churn_df, random_state=42)
    
    lr_res = churn_results['baseline_lr']
    rf_res = churn_results['improved_rf']
    print(f"  Baseline (Logistic Regression) ROC-AUC: {lr_res['roc_auc']:.4f} | F1: {lr_res['f1_score']:.4f}")
    print(f"  Enhanced (Random Forest)       ROC-AUC: {rf_res['roc_auc']:.4f} | F1: {rf_res['f1_score']:.4f}")

    # Save Churn Confusion Matrix & Feature Importances
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    sns.heatmap(rf_res['confusion_matrix'], annot=True, fmt='d', cmap='Greens', ax=axes[0])
    axes[0].set_title('Random Forest Confusion Matrix')
    axes[0].set_xlabel('Predicted')
    axes[0].set_ylabel('Actual')

    feat_series = pd.Series(rf_res['feature_importances']).sort_values(ascending=True)
    feat_series.plot(kind='barh', ax=axes[1], color='#4f46e5')
    axes[1].set_title('Churn Feature Importance')
    plt.tight_layout()
    plt.savefig(reports_dir / "churn_evaluation_and_importance.png", dpi=300)
    plt.close()

    # 5. Review Volume Demand Forecasting
    print("\n[Step 5/5] Generating Time-Series Review Demand Forecast...")
    ts = prepare_time_series(df, freq='W')
    forecast_df = forecast_demand(ts, horizon_periods=12)
    
    plt.figure(figsize=(10, 5))
    plt.plot(ts.index[-52:], ts['review_count'][-52:], label='Historical Weekly Volume', color='#0284c7')
    plt.plot(forecast_df.index, forecast_df['forecast'], label='12-Week Forecast', color='#e11d48', linestyle='--')
    plt.fill_between(forecast_df.index, forecast_df['lower_bound'], forecast_df['upper_bound'], color='#e11d48', alpha=0.15)
    plt.title('E-Commerce Weekly Review Volume Forecast (Next 90 Days)')
    plt.xlabel('Date')
    plt.ylabel('Review Count')
    plt.legend()
    plt.tight_layout()
    plt.savefig(reports_dir / "demand_forecast_90days.png", dpi=300)
    plt.close()
    print("  Saved demand forecast chart to reports/figures/")

    # 6. Market Basket Analysis
    print("\n[Bonus] Mining Market Basket Co-occurrences...")
    basket = compute_market_basket(df, min_support=2, top_n=10)
    print(f"  Found {len(basket)} product pairs with recurring multi-item purchases.")

    print("\n" + "=" * 70)
    print("[DONE] Pipeline Run Completed Successfully! All outputs refreshed.")
    print("=" * 70)


if __name__ == '__main__':
    run_pipeline()

