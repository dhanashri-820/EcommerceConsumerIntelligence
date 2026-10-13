"""
Sentiment Predictor Module for EcommerceConsumerIntelligence.
Provides unified inference using DistilBERT, Logistic Regression, or Linear SVM.
"""

from pathlib import Path
from typing import Dict, List, Any, Union, Optional
import numpy as np
import joblib
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification


class SentimentPredictor:
    """Predicts sentiment for e-commerce reviews using saved models."""

    def __init__(self, models_dir: Optional[str] = None):
        project_root = Path(__file__).resolve().parent.parent if "__file__" in locals() else Path(".")
        self.models_dir = Path(models_dir) if models_dir else (project_root / "models")
        self.device = torch.device("cpu")
        self.id_to_label = {0: "negative", 1: "neutral", 2: "positive"}

        # Paths
        self.distilbert_path = self.models_dir / "sentiment_model"
        self.lr_path = self.models_dir / "logistic_regression_home.joblib"
        self.svm_path = self.models_dir / "svm_home.joblib"
        self.tfidf_path = self.models_dir / "tfidf_home.joblib"

        # Model containers
        self.tokenizer = None
        self.distilbert_model = None
        self.lr_model = None
        self.svm_model = None
        self.tfidf_vectorizer = None

        self._load_models()

    def _load_models(self):
        """Loads available models from disk."""
        # Load DistilBERT
        if self.distilbert_path.exists():
            try:
                self.tokenizer = AutoTokenizer.from_pretrained(str(self.distilbert_path))
                self.distilbert_model = AutoModelForSequenceClassification.from_pretrained(str(self.distilbert_path))
                self.distilbert_model.to(self.device)
                self.distilbert_model.eval()
            except Exception as e:
                print(f"Warning: Failed to load DistilBERT: {e}")

        # Load TF-IDF vectorizer
        if self.tfidf_path.exists():
            try:
                self.tfidf_vectorizer = joblib.load(self.tfidf_path)
            except Exception as e:
                print(f"Warning: Failed to load TF-IDF vectorizer: {e}")

        # Load Logistic Regression
        if self.lr_path.exists():
            try:
                self.lr_model = joblib.load(self.lr_path)
            except Exception as e:
                print(f"Warning: Failed to load Logistic Regression: {e}")

        # Load Linear SVM
        if self.svm_path.exists():
            try:
                self.svm_model = joblib.load(self.svm_path)
            except Exception as e:
                print(f"Warning: Failed to load Linear SVM: {e}")

    def predict_distilbert(self, text: str) -> Dict[str, Any]:
        """Runs sentiment prediction with DistilBERT."""
        if not self.distilbert_model or not self.tokenizer:
            raise RuntimeError("DistilBERT model not loaded.")

        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=128
        ).to(self.device)

        with torch.no_grad():
            outputs = self.distilbert_model(**inputs)
            probs = torch.softmax(outputs.logits, dim=1)[0].cpu().numpy()

        pred_id = int(np.argmax(probs))
        return {
            "model": "DistilBERT",
            "sentiment": self.id_to_label[pred_id],
            "confidence": float(probs[pred_id]),
            "probabilities": {
                "negative": float(probs[0]),
                "neutral": float(probs[1]),
                "positive": float(probs[2])
            }
        }

    def predict_logistic_regression(self, text: str) -> Dict[str, Any]:
        """Runs sentiment prediction with TF-IDF + Logistic Regression."""
        if not self.lr_model or not self.tfidf_vectorizer:
            raise RuntimeError("Logistic Regression or TF-IDF vectorizer not loaded.")

        vec = self.tfidf_vectorizer.transform([text])
        probs = self.lr_model.predict_proba(vec)[0]
        classes = list(self.lr_model.classes_)
        pred_idx = int(np.argmax(probs))
        sentiment = classes[pred_idx]

        prob_dict = {cls: float(probs[i]) for i, cls in enumerate(classes)}
        return {
            "model": "Logistic Regression",
            "sentiment": sentiment,
            "confidence": float(probs[pred_idx]),
            "probabilities": prob_dict
        }

    def predict_svm(self, text: str) -> Dict[str, Any]:
        """Runs sentiment prediction with TF-IDF + Linear SVM."""
        if not self.svm_model or not self.tfidf_vectorizer:
            raise RuntimeError("Linear SVM or TF-IDF vectorizer not loaded.")

        vec = self.tfidf_vectorizer.transform([text])
        sentiment = str(self.svm_model.predict(vec)[0])
        # Decision function for confidence proxy
        decision = self.svm_model.decision_function(vec)[0]
        # Softmax of decision scores
        exp_d = np.exp(decision - np.max(decision))
        pseudo_probs = exp_d / exp_d.sum()
        classes = list(self.svm_model.classes_)
        pred_idx = classes.index(sentiment)

        return {
            "model": "Linear SVM",
            "sentiment": sentiment,
            "confidence": float(pseudo_probs[pred_idx]),
            "probabilities": {cls: float(pseudo_probs[i]) for i, cls in enumerate(classes)}
        }

    def predict_all(self, text: str) -> Dict[str, Any]:
        """Returns predictions from all available models for side-by-side comparison."""
        results = {}
        if self.distilbert_model:
            results["DistilBERT"] = self.predict_distilbert(text)
        if self.lr_model:
            results["Logistic Regression"] = self.predict_logistic_regression(text)
        if self.svm_model:
            results["Linear SVM"] = self.predict_svm(text)
        return results


if __name__ == "__main__":
    predictor = SentimentPredictor()
    sample = "The build quality is outstanding and it cleans up in seconds!"
    print(f"Testing review: '{sample}'")
    res = predictor.predict_all(sample)
    for model_name, info in res.items():
        print(f"[{model_name}] -> Sentiment: {info['sentiment'].upper()} (Confidence: {info['confidence']*100:.1f}%)")
