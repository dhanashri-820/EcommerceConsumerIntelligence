import os
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

# 1. Setup paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent if "__file__" in locals() else Path(".")
DATA_PATH = PROJECT_ROOT / "data" / "processed" / "home_kitchen_balanced.csv"
MODEL_DIR = PROJECT_ROOT / "models"
OUTPUT_DIR = PROJECT_ROOT / "outputs" / "model_comparison"
TRANSFORMER_OUTPUT = PROJECT_ROOT / "outputs" / "transformer_home"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

print("=" * 70)
print("PHASE 1: EXECUTING MODEL COMPARISON EVALUATION")
print("=" * 70)

# 2. Load dataset
df = pd.read_csv(DATA_PATH)
X = df["text"].astype(str)
y = df["sentiment"]

# 3. Train-test split (canonical 80/20 baseline split)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"Dataset split loaded: {len(X_test):,} test reviews with balanced classes.")

# 4. Load Models & Vectorizer
lr_model = joblib.load(MODEL_DIR / "logistic_regression_home.joblib")
svm_model = joblib.load(MODEL_DIR / "svm_home.joblib")
tfidf = joblib.load(MODEL_DIR / "tfidf_home.joblib")

X_test_vec = tfidf.transform(X_test)

# 5. Evaluate Baseline Models
y_pred_lr = lr_model.predict(X_test_vec)
y_pred_svm = svm_model.predict(X_test_vec)

def compute_metrics(y_true, y_pred, model_name):
    return {
        "Model": model_name,
        "Accuracy": round(accuracy_score(y_true, y_pred) * 100, 2),
        "Macro Precision": round(precision_score(y_true, y_pred, average="macro") * 100, 2),
        "Macro Recall": round(recall_score(y_true, y_pred, average="macro") * 100, 2),
        "Macro F1": round(f1_score(y_true, y_pred, average="macro") * 100, 2),
        "Weighted F1": round(f1_score(y_true, y_pred, average="weighted") * 100, 2)
    }

metrics_lr = compute_metrics(y_test, y_pred_lr, "TF-IDF + Logistic Regression")
metrics_svm = compute_metrics(y_test, y_pred_svm, "TF-IDF + Linear SVM")

# 6. Load DistilBERT Verified Metrics
distil_report = pd.read_csv(TRANSFORMER_OUTPUT / "classification_report.csv", index_col=0)
distil_cm = pd.read_csv(TRANSFORMER_OUTPUT / "confusion_matrix.csv", index_col=0)

metrics_distil = {
    "Model": "DistilBERT (Transformer)",
    "Accuracy": round(float(distil_report.loc["accuracy", "precision"]) * 100, 2),
    "Macro Precision": round(float(distil_report.loc["macro avg", "precision"]) * 100, 2),
    "Macro Recall": round(float(distil_report.loc["macro avg", "recall"]) * 100, 2),
    "Macro F1": round(float(distil_report.loc["macro avg", "f1-score"]) * 100, 2),
    "Weighted F1": round(float(distil_report.loc["weighted avg", "f1-score"]) * 100, 2)
}

# 7. Create Overall Metrics Table
comparison_df = pd.DataFrame([metrics_lr, metrics_svm, metrics_distil])
metrics_csv_path = OUTPUT_DIR / "model_comparison_metrics.csv"
comparison_df.to_csv(metrics_csv_path, index=False)
print("\n--- OVERALL MODEL COMPARISON METRICS (%) ---")
print(comparison_df.to_string(index=False))

# 8. Per-Class F1 Scores
report_lr_dict = classification_report(y_test, y_pred_lr, output_dict=True)
report_svm_dict = classification_report(y_test, y_pred_svm, output_dict=True)

per_class_df = pd.DataFrame([
    {
        "Model": "TF-IDF + Logistic Regression",
        "Negative F1": round(report_lr_dict["negative"]["f1-score"] * 100, 2),
        "Neutral F1": round(report_lr_dict["neutral"]["f1-score"] * 100, 2),
        "Positive F1": round(report_lr_dict["positive"]["f1-score"] * 100, 2)
    },
    {
        "Model": "TF-IDF + Linear SVM",
        "Negative F1": round(report_svm_dict["negative"]["f1-score"] * 100, 2),
        "Neutral F1": round(report_svm_dict["neutral"]["f1-score"] * 100, 2),
        "Positive F1": round(report_svm_dict["positive"]["f1-score"] * 100, 2)
    },
    {
        "Model": "DistilBERT (Transformer)",
        "Negative F1": round(float(distil_report.loc["Negative", "f1-score"]) * 100, 2),
        "Neutral F1": round(float(distil_report.loc["Neutral", "f1-score"]) * 100, 2),
        "Positive F1": round(float(distil_report.loc["Positive", "f1-score"]) * 100, 2)
    }
])
per_class_csv_path = OUTPUT_DIR / "per_class_metrics.csv"
per_class_df.to_csv(per_class_csv_path, index=False)
print("\n--- PER-CLASS F1-SCORES (%) ---")
print(per_class_df.to_string(index=False))

# 9. Generate Charts
# Style
sns.set_theme(style="whitegrid", font="sans-serif")
plt.rcParams["font.size"] = 11

# Chart 1: Overall Performance Comparison
fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
chart_data = comparison_df.melt(id_vars="Model", var_name="Metric", value_name="Score (%)")
palette = ["#3498db", "#e74c3c", "#2ecc71"]

bar_plot = sns.barplot(
    data=chart_data,
    x="Metric",
    y="Score (%)",
    hue="Model",
    palette=palette,
    ax=ax
)

ax.set_title("Sentiment Classification Model Comparison (Home & Kitchen)", fontsize=14, weight="bold", pad=15)
ax.set_ylabel("Score (%)", fontsize=12, weight="bold")
ax.set_xlabel("Evaluation Metric", fontsize=12, weight="bold")
ax.set_ylim(50, 85)
ax.legend(title="Model", frameon=True, loc="lower right")

# Add value labels on top of bars
for p in bar_plot.patches:
    height = p.get_height()
    if height > 0:
        ax.annotate(f"{height:.1f}%",
                    (p.get_x() + p.get_width() / 2., height),
                    ha="center", va="bottom", fontsize=8.5, xytext=(0, 3),
                    textcoords="offset points")

plt.tight_layout()
chart_path = OUTPUT_DIR / "model_comparison_chart.png"
plt.savefig(chart_path)
plt.close()
print(f"\nSaved overall comparison chart to: {chart_path}")

# Chart 2: Per-Class F1 Score Comparison
fig, ax = plt.subplots(figsize=(8.5, 5.5), dpi=300)
per_class_melted = per_class_df.melt(id_vars="Model", var_name="Sentiment Class", value_name="F1 Score (%)")
per_class_melted["Sentiment Class"] = per_class_melted["Sentiment Class"].str.replace(" F1", "")

bar_plot2 = sns.barplot(
    data=per_class_melted,
    x="Sentiment Class",
    y="F1 Score (%)",
    hue="Model",
    palette=palette,
    ax=ax
)

ax.set_title("Per-Class F1-Score Comparison Across Sentiment Classes", fontsize=13, weight="bold", pad=15)
ax.set_ylabel("F1-Score (%)", fontsize=12, weight="bold")
ax.set_xlabel("Sentiment Class", fontsize=12, weight="bold")
ax.set_ylim(50, 95)
ax.legend(title="Model", frameon=True, loc="lower right")

for p in bar_plot2.patches:
    height = p.get_height()
    if height > 0:
        ax.annotate(f"{height:.1f}%",
                    (p.get_x() + p.get_width() / 2., height),
                    ha="center", va="bottom", fontsize=9, xytext=(0, 3),
                    textcoords="offset points")

plt.tight_layout()
per_class_chart_path = OUTPUT_DIR / "per_class_f1_chart.png"
plt.savefig(per_class_chart_path)
plt.close()
print(f"Saved per-class F1 chart to: {per_class_chart_path}")

# Chart 3: Side-by-Side Confusion Matrices
fig, axes = plt.subplots(1, 3, figsize=(16, 4.8), dpi=300)
cm_labels = ["Negative", "Neutral", "Positive"]

# LR CM
cm_lr = confusion_matrix(y_test, y_pred_lr, labels=["negative", "neutral", "positive"])
sns.heatmap(cm_lr, annot=True, fmt="d", cmap="Blues", cbar=False, ax=axes[0],
            xticklabels=cm_labels, yticklabels=cm_labels)
axes[0].set_title("Logistic Regression", fontsize=13, weight="bold")
axes[0].set_xlabel("Predicted Label")
axes[0].set_ylabel("True Label")

# SVM CM
cm_svm = confusion_matrix(y_test, y_pred_svm, labels=["negative", "neutral", "positive"])
sns.heatmap(cm_svm, annot=True, fmt="d", cmap="Oranges", cbar=False, ax=axes[1],
            xticklabels=cm_labels, yticklabels=cm_labels)
axes[1].set_title("Linear SVM", fontsize=13, weight="bold")
axes[1].set_xlabel("Predicted Label")
axes[1].set_ylabel("True Label")

# DistilBERT CM
cm_distil = distil_cm.values
sns.heatmap(cm_distil, annot=True, fmt="d", cmap="Greens", cbar=False, ax=axes[2],
            xticklabels=cm_labels, yticklabels=cm_labels)
axes[2].set_title("DistilBERT Transformer", fontsize=13, weight="bold")
axes[2].set_xlabel("Predicted Label")
axes[2].set_ylabel("True Label")

plt.suptitle("Confusion Matrix Comparison Across Models (N = 3,000)", fontsize=15, weight="bold", y=1.02)
plt.tight_layout()
cm_chart_path = OUTPUT_DIR / "confusion_matrices.png"
plt.savefig(cm_chart_path, bbox_inches="tight")
plt.close()
print(f"Saved confusion matrices figure to: {cm_chart_path}")

print("\n" + "=" * 70)
print("PHASE 1 COMPLETE: All comparison tables and figures successfully saved!")
print("=" * 70)
