# EcommerceConsumerIntelligence - React Analytics Dashboard 🛒

A modern, responsive, SaaS-style analytics frontend for the **EcommerceConsumerIntelligence** Data Science platform.

Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Recharts**.

---

## 🚀 Quick Start

### 1. Ensure the Python FastAPI Backend is Running
From the repository root:
```bash
# In your virtual environment:
uvicorn api:app --host 127.0.0.1 --port 8000
```
API docs will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Start the React Frontend
From the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📦 Features & Pages

1. **Executive Overview (`/`):**
   - KPI metrics: 45,000 processed reviews across 3 categories, top model accuracies.
   - Sentiment distribution donut chart (Positive, Neutral, Negative).
   - Multi-domain horizontal volume comparison.
   - Sample customer review table with star ratings.

2. **Model Comparison:**
   - Benchmarking table: TF-IDF Logistic Regression vs. Linear SVM vs. Fine-tuned DistilBERT.
   - Interactive grouped bar chart for Accuracy, Precision, Recall, Macro F1, Weighted F1.
   - Per-class F1-score breakdown chart across sentiment tiers.
   - Interactive Confusion Matrix heatmaps (N = 3,000).

3. **Aspect-Based Sentiment Analysis (ABSA):**
   - 6 product dimensions: Quality, Price, Delivery, Durability, Design, Usability.
   - Stacked sentiment distribution charts.
   - Filterable clause table with keyword search and sentiment dropdowns.

4. **Consumer Intelligence:**
   - Recurring customer complaints and root-cause failure analysis.
   - Frequently praised features and brand strengths.
   - Actionable engineering, logistics, and marketing recommendations with expected ROI.

5. **Live Review Analyzer:**
   - Real-time review input field with instant sentiment classification.
   - Model selector (DistilBERT, Logistic Regression, Linear SVM, or Compare All).
   - Probability distribution bars and confidence scoring.
   - Extracted aspect breakdown with supporting clause quotes.

---

## ⚙️ Environment Configuration

Create a `.env` file in `frontend/`:
```env
VITE_API_BASE_URL=http://localhost:8000
```
If the backend server is offline, the frontend automatically falls back to verified baseline benchmark metrics, ensuring a seamless presentation experience.
