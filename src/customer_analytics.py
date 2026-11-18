"""
Customer Analytics Module:
- RF-Engagement & K-Means Customer Segmentation
- Cohort Retention Analysis
- Market Basket / Product Association Mining
"""

from typing import Dict, List, Tuple
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler


def compute_rfm_segments(
    df: pd.DataFrame,
    n_clusters: int = 4,
    random_state: int = 42
) -> Tuple[pd.DataFrame, Dict[int, Dict[str, str]]]:
    """
    Compute customer Recency, Frequency, and Sentiment/Verification engagement,
    then apply K-Means clustering.

    Parameters:
    - df: cleaned DataFrame with 'user_id', 'datetime', 'rating', 'helpful_vote'
    - n_clusters: number of segments (default 4)
    - random_state: seed for reproducibility

    Returns:
    - user_rfm: DataFrame indexed by user_id with cluster assignments and RFM scores
    - segment_profiles: dictionary mapping cluster_id to persona name and recommendation
    """
    if 'datetime' not in df.columns:
        raise ValueError("DataFrame must contain 'datetime' column.")

    valid_df = df.dropna(subset=['datetime', 'user_id']).copy()
    ref_date = valid_df['datetime'].max() + pd.Timedelta(days=1)

    # Aggregations per customer
    user_rfm = valid_df.groupby('user_id').agg(
        recency_days=('datetime', lambda x: (ref_date - x.max()).days),
        frequency=('asin', 'count'),
        avg_rating=('rating', 'mean'),
        total_helpful=('helpful_vote', 'sum'),
        verified_ratio=('verified_purchase', lambda x: x.mean() if 'verified_purchase' in valid_df.columns else 1.0)
    ).reset_index()

    # Log-transform skewed features for stable K-Means
    features = ['recency_days', 'frequency', 'avg_rating', 'total_helpful']
    X = user_rfm[features].copy()
    X['recency_days'] = np.log1p(X['recency_days'])
    X['frequency'] = np.log1p(X['frequency'])
    X['total_helpful'] = np.log1p(X['total_helpful'])

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    kmeans = KMeans(n_clusters=n_clusters, random_state=random_state, n_init=10)
    user_rfm['cluster'] = kmeans.fit_predict(X_scaled)

    # Define business personas based on cluster centroids
    cluster_means = user_rfm.groupby('cluster').agg({
        'recency_days': 'mean',
        'frequency': 'mean',
        'avg_rating': 'mean',
        'total_helpful': 'mean'
    })

    # Sort clusters by frequency and rating to label consistently
    segment_profiles: Dict[int, Dict[str, str]] = {}
    for c_id, row in cluster_means.iterrows():
        rec = row['recency_days']
        freq = row['frequency']
        rating = row['avg_rating']

        if freq > 3.0 and rating >= 4.0:
            name = "Champions / Loyal Advocates"
            action = "Enroll in VIP early-access product launches and reward organic brand advocacy."
        elif freq > 2.0 and rating < 3.5:
            name = "High-Volume Critics"
            action = "Priority customer support routing and product quality issue investigation."
        elif rec > 1800 and freq <= 2.0:
            name = "Dormant / Churned Casuals"
            action = "Re-engagement discount campaigns and win-back surveys."
        else:
            name = "Active Emerging Shoppers"
            action = "Nurture with cross-category recommendations to drive second and third purchases."

        segment_profiles[int(c_id)] = {
            'persona': name,
            'avg_recency': f"{rec:.0f} days",
            'avg_frequency': f"{freq:.2f} reviews",
            'avg_rating': f"{rating:.2f} stars",
            'recommendation': action
        }

    user_rfm['segment_name'] = user_rfm['cluster'].map(lambda c: segment_profiles[c]['persona'])
    return user_rfm, segment_profiles


def compute_cohort_retention(df: pd.DataFrame, freq: str = 'Q') -> pd.DataFrame:
    """
    Calculate monthly or quarterly cohort retention heatmap table.

    Parameters:
    - df: cleaned DataFrame with 'user_id' and 'datetime'
    - freq: cohort grouping frequency ('Q' for quarterly, 'M' for monthly)

    Returns:
    - retention_matrix: percentage of cohort returning at period index (0, 1, 2, ...)
    """
    valid_df = df.dropna(subset=['datetime', 'user_id']).copy()
    valid_df['order_period'] = valid_df['datetime'].dt.to_period(freq)

    # Identify customer first cohort period
    cohorts = valid_df.groupby('user_id')['datetime'].min().dt.to_period(freq).reset_index()
    cohorts.columns = ['user_id', 'cohort_period']
    merged = pd.merge(valid_df, cohorts, on='user_id')

    # Calculate period delta
    def period_diff(row):
        return (row['order_period'].year - row['cohort_period'].year) * 4 + (row['order_period'].quarter - row['cohort_period'].quarter)

    if freq == 'Q':
        merged['period_index'] = merged.apply(period_diff, axis=1)
    else:
        merged['period_index'] = (merged['order_period'].year - merged['cohort_period'].year) * 12 + (merged['order_period'].month - merged['cohort_period'].month)

    cohort_group = merged.groupby(['cohort_period', 'period_index'])['user_id'].nunique().reset_index()
    cohort_pivot = cohort_group.pivot(index='cohort_period', columns='period_index', values='user_id')

    # Convert to retention percentage
    cohort_sizes = cohort_pivot.iloc[:, 0]
    retention_matrix = cohort_pivot.divide(cohort_sizes, axis=0) * 100.0

    return retention_matrix.round(1)


def compute_market_basket(
    df: pd.DataFrame,
    min_support: int = 2,
    top_n: int = 15
) -> pd.DataFrame:
    """
    Extract product co-occurrence rules (Market Basket Analysis)
    from customers reviewing multiple ASINs.

    Returns:
    - DataFrame of Item A -> Item B pairs with co-occurrence counts and lift proxy
    """
    multi_reviewers = df.groupby('user_id')['asin'].nunique()
    qualifying_users = multi_reviewers[multi_reviewers >= 2].index

    subset = df[df['user_id'].isin(qualifying_users)][['user_id', 'asin']].drop_duplicates()
    
    # Self-merge to get co-reviewed pairs
    co_occurrences = pd.merge(subset, subset, on='user_id')
    co_occurrences = co_occurrences[co_occurrences['asin_x'] < co_occurrences['asin_y']]

    basket_pairs = co_occurrences.groupby(['asin_x', 'asin_y']).size().reset_index(name='co_review_count')
    basket_pairs = basket_pairs[basket_pairs['co_review_count'] >= min_support]
    basket_pairs = basket_pairs.sort_values(by='co_review_count', ascending=False).head(top_n)

    return basket_pairs

