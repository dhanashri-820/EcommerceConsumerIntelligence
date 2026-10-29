# Consumer IQ — Frontend

Modern, production-ready, dark-themed React + TypeScript intelligence dashboard for the **EcommerceConsumerIntelligence** platform.

Features real-time multi-model sentiment inference, multi-axis aspect polarity radar, model benchmarking confusion heatmaps, and voice-of-customer mining.

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: v18+ (tested on v26)
- **Python**: 3.9+ with virtual environment activated (`.venv`)
- **FastAPI Backend**: running on port 8000

---

### Step 1: Start the Backend (Terminal 1)
From the repository root:
```bash
# Activate virtual environment if applicable
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate

uvicorn api:app --port 8000 --reload
```
The FastAPI backend will start at `http://127.0.0.1:8000`.

---

### Step 2: Start the Frontend (Terminal 2)
From the repository root:
```bash
cd frontend
npm install
npm run dev
```

---

### Step 3: Access the Application
Open your browser and navigate to:
👉 **[http://127.0.0.1:5173/](http://127.0.0.1:5173/)**

---

## 🔒 Authentication Flow
1. Landing on `http://127.0.0.1:5173/` checks for an existing session via `GET /api/auth/me`.
2. If unauthenticated, you will be redirected to `/login`.
3. Create a new account at `/register` or sign in with your credentials.
4. Session tokens are secured using HttpOnly cookies with automatic proxy pass-through to `http://127.0.0.1:8000`.

---

## 📊 Dashboard Modules
- **Overview (`/`)**: Executive KPIs with inline sparklines, class polarity donut, and domain breakdown bars.
- **Model Benchmarks (`/models`)**: Comparative grouped bar charts, 5-shade confusion heatmaps, and per-class F1 analysis across DistilBERT, Logistic Regression, and Linear SVM.
- **Aspect Radar (`/absa`)**: Hexagonal multi-axis radar chart and custom stacked polarity bars across Quality, Price, Delivery, Durability, Design, and Usability.
- **Voice of Customer (`/insights`)**: Strategic driver cards with verbatim customer quotes, actions, and projected ROI.
- **Live Predictor (`/predict`)**: Real-time review analyzer with multi-model inference consensus and fine-grained aspect clause breakdown.

---

## 🛠️ Tech Stack
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: TailwindCSS (Dark ops command center aesthetic)
- **Data Caching**: `@tanstack/react-query`
- **Routing**: `react-router-dom` v6
- **Charts**: `recharts` (Pie, Bar, Radar)
- **Icons**: `lucide-react`
- **State**: `zustand` (with persist)
- **Client**: `axios` (`withCredentials: true`)
