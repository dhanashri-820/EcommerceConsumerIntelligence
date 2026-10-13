"""
Aspect-Based Sentiment Analysis (ABSA) Module for EcommerceConsumerIntelligence.

Identifies key product aspects:
- Quality
- Price
- Delivery
- Durability
- Design
- Usability

Determines sentiment associated with each aspect mentioned in reviews.
"""

import re
from pathlib import Path
from typing import Dict, List, Any, Optional
import pandas as pd
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Aspect keywords and lexicons tailored for E-commerce & Home products
ASPECT_KEYWORDS = {
    "Quality": [
        "quality", "material", "materials", "build", "craftsmanship",
        "sturdy", "flimsy", "cheap", "poorly made", "well made", "premium",
        "defective", "solid", "junk", "scratch", "scratched", "finish"
    ],
    "Price": [
        "price", "pricing", "cost", "value", "expensive", "affordable",
        "worth", "money", "overpriced", "deal", "cheap", "bargain", "waste"
    ],
    "Delivery": [
        "delivery", "shipping", "shipped", "arrived", "packaging",
        "packaged", "package", "box", "damaged", "fast delivery",
        "late", "delayed", "courier", "broken in shipping"
    ],
    "Durability": [
        "durability", "durable", "lasting", "broke", "broken",
        "stopped working", "lasts", "cracked", "crack", "tear",
        "wear", "longevity", "fell apart", "burn out"
    ],
    "Design": [
        "design", "appearance", "look", "looks", "looking", "color",
        "colour", "size", "fit", "sleek", "modern", "aesthetic",
        "ugly", "compact", "bulky", "style", "heavy", "lightweight"
    ],
    "Usability": [
        "easy to use", "easy to clean", "usability", "function",
        "functional", "works", "performance", "install", "installation",
        "instructions", "assembly", "convenient", "noisy", "loud",
        "manual", "setting", "controls", "difficult to use"
    ]
}


class AspectSentimentAnalyzer:
    """Extracts product aspects and determines aspect-level sentiment."""

    def __init__(self, model_dir: Optional[str] = None):
        project_root = Path(__file__).resolve().parent.parent if "__file__" in locals() else Path(".")
        if model_dir is None:
            model_dir = str(project_root / "models" / "sentiment_model")

        self.model_dir = Path(model_dir)
        self.device = torch.device("cpu")
        self.id_to_label = {0: "negative", 1: "neutral", 2: "positive"}

        if self.model_dir.exists():
            self.tokenizer = AutoTokenizer.from_pretrained(str(self.model_dir))
            self.model = AutoModelForSequenceClassification.from_pretrained(str(self.model_dir))
            self.model.to(self.device)
            self.model.eval()
            self.use_transformer = True
        else:
            self.use_transformer = False

    def split_into_clauses(self, text: str) -> List[str]:
        """Splits review into clauses using punctuation and conjunctions."""
        # Split on sentence boundaries and contrasting conjunctions
        segments = re.split(r'[.!?;\n]|(?:\b(?:but|however|although|though|yet|while|whereas)\b)', text, flags=re.IGNORECASE)
        cleaned = [seg.strip() for seg in segments if len(seg.strip()) > 3]
        return cleaned if cleaned else [text.strip()]

    def predict_clause_sentiment(self, clause: str) -> Dict[str, Any]:
        """Predicts sentiment label and confidence for a specific clause."""
        if not self.use_transformer or not clause.strip():
            return {"sentiment": "neutral", "confidence": 0.50}

        inputs = self.tokenizer(
            clause,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=128
        ).to(self.device)

        with torch.no_grad():
            outputs = self.model(**inputs)
            probs = torch.softmax(outputs.logits, dim=1)[0]
            pred_id = torch.argmax(probs).item()
            confidence = probs[pred_id].item()

        return {
            "sentiment": self.id_to_label[pred_id],
            "confidence": round(confidence, 4)
        }

    def analyze_review(self, review_text: str) -> Dict[str, Any]:
        """
        Analyzes a single review to extract aspect mentions and sentiment.
        Returns a dictionary mapping aspect names to their sentiment and supporting text.
        """
        if not isinstance(review_text, str) or not review_text.strip():
            return {"aspects": {}}

        clauses = self.split_into_clauses(review_text)
        aspect_results = {}

        for clause in clauses:
            clause_lower = clause.lower()
            for aspect, keywords in ASPECT_KEYWORDS.items():
                # Check keyword match
                for kw in keywords:
                    # Match whole word / phrase
                    pattern = r'\b' + re.escape(kw) + r'\b'
                    if re.search(pattern, clause_lower):
                        pred = self.predict_clause_sentiment(clause)
                        
                        # Store or update aspect
                        if aspect not in aspect_results:
                            aspect_results[aspect] = {
                                "sentiment": pred["sentiment"],
                                "confidence": pred["confidence"],
                                "matched_keyword": kw,
                                "supporting_text": clause
                            }
                        break

        return {"aspects": aspect_results}

    def analyze_dataset(self, df: pd.DataFrame, text_col: str = "text", max_samples: int = 1500) -> pd.DataFrame:
        """Runs ABSA over a dataset and returns structured aspect-level DataFrame."""
        sample_df = df.head(max_samples).copy()
        records = []

        for idx, row in sample_df.iterrows():
            text = str(row.get(text_col, ""))
            analysis = self.analyze_review(text)
            aspects = analysis.get("aspects", {})

            for aspect_name, data in aspects.items():
                records.append({
                    "review_id": idx,
                    "review_text": text[:200] + ("..." if len(text) > 200 else ""),
                    "aspect": aspect_name,
                    "sentiment": data["sentiment"],
                    "confidence": data["confidence"],
                    "keyword": data["matched_keyword"],
                    "clause": data["supporting_text"]
                })

        return pd.DataFrame(records)


def run_absa_validation():
    """Validates ABSA with manually reviewed test examples."""
    analyzer = AspectSentimentAnalyzer()

    test_examples = [
        "The product quality is excellent, but delivery was slow.",
        "Very expensive for such cheap plastic material, broke within two days.",
        "Beautiful modern design and very easy to clean and assemble.",
        "Customer service was unhelpful and shipping was delayed by two weeks.",
        "Affordable price and fantastic durability, works perfectly every day."
    ]

    print("=" * 65)
    print("ABSA VALIDATION WITH MANUALLY VERIFIED EXAMPLES")
    print("=" * 65)

    for ex in test_examples:
        res = analyzer.analyze_review(ex)
        print(f"\nReview: \"{ex}\"")
        for aspect, info in res["aspects"].items():
            print(f"  • {aspect:11}: {info['sentiment'].upper():8} (Conf: {info['confidence']*100:.1f}%) | '{info['supporting_text']}'")

    return analyzer


if __name__ == "__main__":
    analyzer = run_absa_validation()

    # Process and save ABSA results from Home & Kitchen dataset
    project_root = Path(__file__).resolve().parent.parent if "__file__" in locals() else Path(".")
    data_path = project_root / "data" / "processed" / "home_kitchen_balanced.csv"
    output_dir = project_root / "outputs" / "absa"
    output_dir.mkdir(parents=True, exist_ok=True)

    if data_path.exists():
        print("\nProcessing Home & Kitchen reviews for Aspect Sentiment Analysis...")
        df = pd.read_csv(data_path)
        absa_results = analyzer.analyze_dataset(df, text_col="text", max_samples=1000)
        
        output_file = output_dir / "aspect_sentiment_results.csv"
        absa_results.to_csv(output_file, index=False)
        print(f"Saved {len(absa_results)} aspect mentions to: {output_file}")
        
        # Summary by Aspect
        summary = absa_results.groupby(["aspect", "sentiment"]).size().unstack(fill_value=0)
        summary_file = output_dir / "aspect_summary.csv"
        summary.to_csv(summary_file)
        print("\n--- ASPECT-LEVEL SENTIMENT DISTRIBUTION ---")
        print(summary)
