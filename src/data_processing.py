"""
Data Cleaning & Preprocessing Pipeline
Provides reusable, tested transformation logic for raw and processed e-commerce review datasets.
"""

from pathlib import Path
from typing import Dict, Optional, Tuple, Union
import numpy as np
import pandas as pd


def load_dataset(filepath: Union[str, Path]) -> pd.DataFrame:
    """Load a CSV dataset into a pandas DataFrame with validation."""
    path = Path(filepath)
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found at {path}")
    df = pd.read_csv(path)
    return df


def clean_review_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean review texts and timestamps:
    - Fills missing titles/texts with empty strings
    - Converts timestamp (ms epoch or ISO string) to UTC datetime
    - Strips whitespace
    - Adds combined_text = title + ' ' + text
    """
    df = df.copy()
    
    # Handle text columns
    if 'title' in df.columns:
        df['title'] = df['title'].fillna('').astype(str).str.strip()
    else:
        df['title'] = ''
        
    if 'text' in df.columns:
        df['text'] = df['text'].fillna('').astype(str).str.strip()
    else:
        df['text'] = ''
        
    df['combined_text'] = (df['title'] + " " + df['text']).str.strip()

    # Handle timestamp conversion
    if 'timestamp' in df.columns:
        # Check if numeric (ms since epoch)
        if pd.api.types.is_numeric_dtype(df['timestamp']):
            df['datetime'] = pd.to_datetime(df['timestamp'], unit='ms', errors='coerce')
        else:
            # Try parsing mixed or string
            df['datetime'] = pd.to_datetime(df['timestamp'], errors='coerce')
            
        df['date'] = df['datetime'].dt.date
        df['year_month'] = df['datetime'].dt.to_period('M')

    # Normalize sentiment label if missing
    if 'sentiment' not in df.columns and 'rating' in df.columns:
        df['sentiment'] = df['rating'].apply(rating_to_sentiment)

    return df


def rating_to_sentiment(rating: Union[int, float]) -> str:
    """Map a 1-5 star numerical rating into 3-class sentiment category."""
    try:
        r = float(rating)
    except (ValueError, TypeError):
        return 'neutral'

    if r <= 2.0:
        return 'negative'
    elif r == 3.0:
        return 'neutral'
    else:
        return 'positive'


def summarize_dataset(df: pd.DataFrame) -> Dict[str, Union[int, float]]:
    """Return key metrics and descriptive statistics for a processed dataset."""
    total_reviews = len(df)
    unique_users = df['user_id'].nunique() if 'user_id' in df.columns else 0
    unique_products = df['asin'].nunique() if 'asin' in df.columns else 0
    avg_rating = float(df['rating'].mean()) if 'rating' in df.columns else 0.0

    return {
        'total_reviews': total_reviews,
        'unique_users': unique_users,
        'unique_products': unique_products,
        'avg_rating': round(avg_rating, 2)
    }

