"""
Unit tests for EcommerceConsumerIntelligence data processing pipeline.
Compatible with standard unittest runner and pytest.
"""

from pathlib import Path
import unittest
import sys
import pandas as pd

# Ensure src/ is accessible
sys.path.append(str(Path(__file__).resolve().parent.parent / "src"))

from data_processing import clean_review_data, rating_to_sentiment, summarize_dataset


class TestDataProcessing(unittest.TestCase):

    def test_rating_to_sentiment(self):
        """Verify star rating mapping to 3-tier sentiment."""
        self.assertEqual(rating_to_sentiment(1.0), 'negative')
        self.assertEqual(rating_to_sentiment(2), 'negative')
        self.assertEqual(rating_to_sentiment(3.0), 'neutral')
        self.assertEqual(rating_to_sentiment(4.0), 'positive')
        self.assertEqual(rating_to_sentiment(5), 'positive')
        self.assertEqual(rating_to_sentiment(None), 'neutral')

    def test_clean_review_data(self):
        """Verify text concatenation, missing values, and datetime conversion."""
        raw_sample = pd.DataFrame({
            'rating': [5.0, 1.0],
            'title': ['Great tool', None],
            'text': ['Works well.', 'Broke on day one.'],
            'timestamp': [1672531199000, 1675209599000],  # 2022-12-31, 2023-01-31
            'user_id': ['U1', 'U2'],
            'asin': ['A1', 'A2']
        })

        cleaned = clean_review_data(raw_sample)

        self.assertIn('combined_text', cleaned.columns)
        self.assertEqual(cleaned.loc[0, 'combined_text'], 'Great tool Works well.')
        self.assertEqual(cleaned.loc[1, 'combined_text'], 'Broke on day one.')
        self.assertIn('datetime', cleaned.columns)
        self.assertEqual(cleaned['datetime'].iloc[0].year, 2022)
        self.assertEqual(cleaned['sentiment'].tolist(), ['positive', 'negative'])

    def test_summarize_dataset(self):
        """Verify high-level summary metrics computation."""
        df = pd.DataFrame({
            'rating': [4.0, 2.0, 3.0],
            'user_id': ['U1', 'U2', 'U1'],
            'asin': ['P1', 'P2', 'P3']
        })
        summary = summarize_dataset(df)
        self.assertEqual(summary['total_reviews'], 3)
        self.assertEqual(summary['unique_users'], 2)
        self.assertEqual(summary['unique_products'], 3)
        self.assertEqual(summary['avg_rating'], 3.0)


if __name__ == '__main__':
    unittest.main()
