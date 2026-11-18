"""
Customer Churn Prediction Pipeline:
- Behavioral churn feature engineering
- Baseline (Logistic Regression) vs. Enhanced Model (RandomForest)
- Cross-validation, ROC-AUC, Precision/Recall, Confusion Matrix
- Model Feature Importances
"""

from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    roc_auc_score,
    f1_score,
    precision_score,
    recall_score,
    confusion_matrix,
    classification_report
)
from sklearn.preprocessing import StandardScaler


def build_churn_features(
    df: pd.DataFrame,
    inactivity_days_threshold: int = 730
) -> pd.DataFrame:
    """
    Construct customer-level tabular features for churn prediction:
    - Target: churned (1 if inactive for > inactivity_days_threshold from reference date, else 0)
    - Features: frequency, avg_rating, rating_std, verified_ratio, helpful_votes, sentiment_skew
    """
    if 'datetime' not in df.columns:
        raise ValueError("DataFrame must contain 'datetime' column.")

    valid_df = df.dropna(subset=['datetime', 'user_id']).copy()
    ref_date = valid_df['datetime'].max()

    def calc_features(group: pd.DataFrame) -> pd.Series:
        last_date = group['datetime'].max()
        first_date = group['datetime'].min()
        recency = (ref_date - last_date).days
        tenure = max(1, (last_date - first_date).days)
        freq = len(group)
        avg_rating = group['rating'].mean()
        rating_std = group['rating'].std() if freq > 1 else 0.0
        verified_ratio = group['verified_purchase'].mean() if 'verified_purchase' in group.columns else 1.0
        helpful = group['helpful_vote'].sum() if 'helpful_vote' in group.columns else 0
        neg_count = (group['sentiment'] == 'negative').sum() if 'sentiment' in group.columns else 0

        churned = 1 if recency >= inactivity_days_threshold else 0

        return pd.Series({
            'recency_days': recency,
            'tenure_days': tenure,
            'frequency': freq,
            'review_velocity': freq / tenure,
            'avg_rating': avg_rating,
            'rating_std': rating_std,
            'verified_ratio': verified_ratio,
            'helpful_votes': helpful,
            'negative_reviews': neg_count,
            'churned': churned
        })

    churn_df = valid_df.groupby('user_id').apply(calc_features).reset_index()
    return churn_df


def train_churn_models(
    churn_df: pd.DataFrame,
    random_state: int = 42
) -> Dict[str, Any]:
    """
    Train and compare Baseline (Logistic Regression) vs. Improved (Random Forest) churn models.
    Returns metrics, confusion matrices, and feature importance.
    """
    feature_cols = [
        'tenure_days', 'frequency', 'review_velocity',
        'avg_rating', 'rating_std', 'verified_ratio',
        'helpful_votes', 'negative_reviews'
    ]

    X = churn_df[feature_cols].fillna(0)
    y = churn_df['churned'].astype(int)

    # Train-test split (80/20 stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=random_state, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 1. Baseline Model: Logistic Regression
    lr = LogisticRegression(random_state=random_state, max_iter=1000)
    lr.fit(X_train_scaled, y_train)
    lr_preds = lr.predict(X_test_scaled)
    lr_probs = lr.predict_proba(X_test_scaled)[:, 1] if len(np.unique(y)) > 1 else np.zeros(len(y_test))

    # 2. Improved Model: Random Forest
    rf = RandomForestClassifier(
        n_estimators=100, max_depth=6, random_state=random_state, n_jobs=-1
    )
    rf.fit(X_train, y_train)
    rf_preds = rf.predict(X_test)
    rf_probs = rf.predict_proba(X_test)[:, 1] if len(np.unique(y)) > 1 else np.zeros(len(y_test))

    # Cross-validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=random_state)
    lr_cv_auc = cross_val_score(lr, X_train_scaled, y_train, cv=cv, scoring='roc_auc').mean()
    rf_cv_auc = cross_val_score(rf, X_train, y_train, cv=cv, scoring='roc_auc').mean()

    # Metrics Dictionary
    results = {
        'baseline_lr': {
            'accuracy': float(accuracy_score(y_test, lr_preds)),
            'roc_auc': float(roc_auc_score(y_test, lr_probs)),
            'f1_score': float(f1_score(y_test, lr_preds, zero_division=0)),
            'precision': float(precision_score(y_test, lr_preds, zero_division=0)),
            'recall': float(recall_score(y_test, lr_preds, zero_division=0)),
            'cv_roc_auc': float(lr_cv_auc),
            'confusion_matrix': confusion_matrix(y_test, lr_preds).tolist()
        },
        'improved_rf': {
            'accuracy': float(accuracy_score(y_test, rf_preds)),
            'roc_auc': float(roc_auc_score(y_test, rf_probs)),
            'f1_score': float(f1_score(y_test, rf_preds, zero_division=0)),
            'precision': float(precision_score(y_test, rf_preds, zero_division=0)),
            'recall': float(recall_score(y_test, rf_preds, zero_division=0)),
            'cv_roc_auc': float(rf_cv_auc),
            'confusion_matrix': confusion_matrix(y_test, rf_preds).tolist(),
            'feature_importances': dict(zip(feature_cols, rf.feature_importances_.round(4).tolist()))
        },
        'models': {
            'lr': lr,
            'rf': rf,
            'scaler': scaler
        },
        'test_data': {
            'X_test': X_test,
            'y_test': y_test,
            'rf_probs': rf_probs,
            'lr_probs': lr_probs
        }
    }

    return results

