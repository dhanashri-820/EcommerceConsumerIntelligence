"""
EcommerceConsumerIntelligence - Interactive Streamlit Dashboard
Third-Year B.Tech Computer Engineering Data Science Project
"""

import sys
from pathlib import Path
import streamlit as st
import pandas as pd
import numpy as np
import altair as alt

# Ensure src is importable
PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.append(str(PROJECT_ROOT / "src"))

from sentiment_predictor import SentimentPredictor
from aspect_extraction import AspectSentimentAnalyzer

# Page configuration
st.set_page_config(
    page_title="Ecommerce Consumer Intelligence",
    page_icon="🛒",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for polished academic dashboard
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 700;
        color: #1E293B;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #64748B;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background-color: #F8FAFC;
        border-radius: 10px;
        padding: 1.2rem;
        border: 1px solid #E2E8F0;
        text-align: center;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }
    .stTabs [data-baseweb="tab"] {
        padding: 8px 16px;
        border-radius: 6px;
    }
</style>
""", unsafe_allow_html=True)


@st.cache_resource
def load_sentiment_predictor():
    return SentimentPredictor(models_dir=str(PROJECT_ROOT / "models"))


@st.cache_resource
def load_absa_analyzer():
    return AspectSentimentAnalyzer(model_dir=str(PROJECT_ROOT / "models" / "sentiment_model"))


@st.cache_data
def load_comparison_data():
    comp_file = PROJECT_ROOT / "outputs" / "model_comparison" / "model_comparison_metrics.csv"
    per_class_file = PROJECT_ROOT / "outputs" / "model_comparison" / "per_class_metrics.csv"
    
    df_comp = pd.read_csv(comp_file) if comp_file.exists() else pd.DataFrame()
    df_per_class = pd.read_csv(per_class_file) if per_class_file.exists() else pd.DataFrame()
    return df_comp, df_per_class


@st.cache_data
def load_absa_data():
    absa_file = PROJECT_ROOT / "outputs" / "absa" / "aspect_sentiment_results.csv"
    summary_file = PROJECT_ROOT / "outputs" / "absa" / "aspect_summary.csv"
    
    df_absa = pd.read_csv(absa_file) if absa_file.exists() else pd.DataFrame()
    df_summary = pd.read_csv(summary_file) if summary_file.exists() else pd.DataFrame()
    return df_absa, df_summary


@st.cache_data
def load_consumer_insights():
    comp_file = PROJECT_ROOT / "outputs" / "consumer_insights" / "top_complaints.csv"
    praise_file = PROJECT_ROOT / "outputs" / "consumer_insights" / "praised_features.csv"
    rec_file = PROJECT_ROOT / "outputs" / "consumer_insights" / "actionable_recommendations.csv"

    df_comp = pd.read_csv(comp_file) if comp_file.exists() else pd.DataFrame()
    df_praise = pd.read_csv(praise_file) if praise_file.exists() else pd.DataFrame()
    df_rec = pd.read_csv(rec_file) if rec_file.exists() else pd.DataFrame()
    return df_comp, df_praise, df_rec


# Sidebar Navigation
st.sidebar.image("https://img.icons8.com/isometric/100/shopping-cart.png", width=70)
st.sidebar.title("Navigation")
page = st.sidebar.radio(
    "Go to",
    [
        "📊 Executive Overview",
        "🤖 Model Comparison",
        "🔍 Aspect-Based Sentiment (ABSA)",
        "💡 Consumer Intelligence",
        "🧪 Live Review Predictor"
    ]
)

st.sidebar.markdown("---")
st.sidebar.markdown("**Project:** EcommerceConsumerIntelligence")
st.sidebar.markdown("**Focus Domain:** Home & Kitchen")
st.sidebar.markdown("**B.Tech Computer Engineering (Data Science)**")


# ==============================================================================
# PAGE 1: EXECUTIVE OVERVIEW
# ==============================================================================
if page == "📊 Executive Overview":
    st.markdown('<div class="main-header">🛒 E-Commerce Consumer Intelligence System</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Analyzing Customer Reviews with Transformers, Aspect-Based Sentiment Analysis & Actionable Insights</div>', unsafe_allow_html=True)

    # Metric Row
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.metric("Total Balanced Reviews", "15,000", "5,000 / class")
    with c2:
        st.metric("Best Model Accuracy", "74.03%", "DistilBERT (+4.13% over LR)")
    with c3:
        st.metric("Best Macro F1-Score", "74.11%", "DistilBERT (+4.03% over LR)")
    with c4:
        st.metric("Key Aspects Tracked", "6 Categories", "Quality, Price, Delivery, etc.")

    st.markdown("---")

    col_left, col_right = st.columns([1.2, 1])

    with col_left:
        st.subheader("📌 Project Objectives & Architecture")
        st.markdown("""
        Online customer feedback provides crucial signals for product managers, logistics teams, and marketing specialists. 
        However, traditional overall star ratings fail to pinpoint *why* a customer liked or disliked a product.

        This system addresses that gap through a 5-phase data science workflow:
        1. **Multi-Domain Data Engineering:** Balanced datasets across Home & Kitchen, Appliances, and Sports & Outdoors.
        2. **Baseline vs Transformer Benchmarking:** Systematic comparison of TF-IDF + Logistic Regression, Linear SVM, and fine-tuned DistilBERT.
        3. **Aspect-Based Sentiment Analysis (ABSA):** Clause-level extraction associating sentiments with specific product facets.
        4. **Actionable Business Intelligence:** Frequency clustering of pain points to derive evidence-based engineering recommendations.
        5. **Interactive Intelligence Dashboard:** Real-time inference and metric exploration.
        """)

    with col_right:
        st.subheader("🏷️ Dataset Class Balance (Home & Kitchen)")
        sentiment_dist = pd.DataFrame({
            "Sentiment": ["Negative (1-2★)", "Neutral (3★)", "Positive (4-5★)"],
            "Reviews": [5000, 5000, 5000]
        })
        chart = alt.Chart(sentiment_dist).mark_arc(innerRadius=50).encode(
            theta=alt.Theta(field="Reviews", type="quantitative"),
            color=alt.Color(field="Sentiment", type="nominal", scale=alt.Scale(range=["#EF4444", "#F59E0B", "#10B981"])),
            tooltip=["Sentiment", "Reviews"]
        ).properties(width=320, height=260)
        st.altair_chart(chart, use_container_width=True)

    st.subheader("📂 Processed Domains Overview")
    domain_df = pd.DataFrame({
        "Domain": ["Home & Kitchen (Primary)", "Appliances (Transfer Test)", "Sports & Outdoors (Transfer Test)"],
        "Total Reviews": [15000, 15000, 15000],
        "Classes": ["Balanced (3-Class)", "Balanced (3-Class)", "Balanced (3-Class)"],
        "Vocabulary Features": [43377, 39120, 41250],
        "DistilBERT Macro F1": ["74.11%", "Tested in cross-domain", "Tested in cross-domain"]
    })
    st.dataframe(domain_df, use_container_width=True)


# ==============================================================================
# PAGE 2: MODEL COMPARISON
# ==============================================================================
elif page == "🤖 Model Comparison":
    st.markdown('<div class="main-header">🤖 Machine Learning Model Benchmarking</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Evaluating TF-IDF Baselines against Fine-Tuned DistilBERT on 3,000 Test Reviews</div>', unsafe_allow_html=True)

    df_comp, df_per_class = load_comparison_data()

    if not df_comp.empty:
        st.subheader("📋 Overall Performance Metrics (%)")
        st.dataframe(df_comp.style.highlight_max(subset=["Accuracy", "Macro Precision", "Macro Recall", "Macro F1", "Weighted F1"], color="#DCFCE7"), use_container_width=True)

        st.markdown("---")
        c1, c2 = st.columns(2)

        with c1:
            st.subheader("📊 Metric Comparison Bar Chart")
            chart_melted = df_comp.melt(id_vars="Model", var_name="Metric", value_name="Score (%)")
            bar_chart = alt.Chart(chart_melted).mark_bar().encode(
                x=alt.X("Metric:N", title="Evaluation Metric"),
                y=alt.Y("Score (%):Q", scale=alt.Scale(domain=[50, 85]), title="Score (%)"),
                color=alt.Color("Model:N", scale=alt.Scale(range=["#3B82F6", "#F97316", "#10B981"])),
                xOffset="Model:N",
                tooltip=["Model", "Metric", "Score (%)"]
            ).properties(height=380)
            st.altair_chart(bar_chart, use_container_width=True)

        with c2:
            st.subheader("🎯 Per-Class F1-Score Breakdown")
            if not df_per_class.empty:
                st.dataframe(df_per_class, use_container_width=True)
                per_class_melted = df_per_class.melt(id_vars="Model", var_name="Class", value_name="F1 Score (%)")
                per_class_chart = alt.Chart(per_class_melted).mark_bar().encode(
                    x=alt.X("Class:N", title="Sentiment Class"),
                    y=alt.Y("F1 Score (%):Q", scale=alt.Scale(domain=[50, 95]), title="F1-Score (%)"),
                    color=alt.Color("Model:N", scale=alt.Scale(range=["#3B82F6", "#F97316", "#10B981"])),
                    xOffset="Model:N",
                    tooltip=["Model", "Class", "F1 Score (%)"]
                ).properties(height=260)
                st.altair_chart(per_class_chart, use_container_width=True)

        st.markdown("---")
        st.subheader("🔍 Confusion Matrix Comparison (N = 3,000)")
        cm_path = PROJECT_ROOT / "outputs" / "model_comparison" / "confusion_matrices.png"
        if cm_path.exists():
            st.image(str(cm_path), caption="Side-by-side Confusion Matrices: Logistic Regression vs Linear SVM vs DistilBERT", use_container_width=True)

        st.subheader("💡 Academic Discussion & Findings")
        st.info("""
        **Key Insights:**
        1. **DistilBERT Outperforms Baselines:** DistilBERT achieves **74.03% accuracy** and **74.11% macro F1-score**, exceeding Logistic Regression (69.90%) and Linear SVM (67.47%).
        2. **Contextual Attention vs. Bag-of-Words:** DistilBERT captures bidirectional context and negation handling (e.g. *"not bad at all"* vs *"not good"*), which n-gram Bag-of-Words TF-IDF struggles to disambiguate.
        3. **Neutral Class Difficulty:** Neutral reviews present the highest classification challenge across all models (~58%–65% F1), reflecting mixed customer sentiments and ambiguous star ratings.
        """)
    else:
        st.warning("Model comparison data not found. Please run src/model_comparison.py first.")


# ==============================================================================
# PAGE 3: ASPECT-BASED SENTIMENT ANALYSIS (ABSA)
# ==============================================================================
elif page == "🔍 Aspect-Based Sentiment (ABSA)":
    st.markdown('<div class="main-header">🔍 Aspect-Based Sentiment Analysis (ABSA)</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Fine-Grained Sentiment Extraction for Quality, Price, Delivery, Durability, Design & Usability</div>', unsafe_allow_html=True)

    df_absa, df_summary = load_absa_data()

    if not df_summary.empty:
        col1, col2 = st.columns([1, 1.2])

        with col1:
            st.subheader("📊 Aspect Mentions Summary")
            st.dataframe(df_summary, use_container_width=True)

        with col2:
            st.subheader("📈 Aspect Sentiment Distribution")
            df_plot = df_summary.reset_index().melt(id_vars="aspect", var_name="Sentiment", value_name="Mentions")
            absa_chart = alt.Chart(df_plot).mark_bar().encode(
                x=alt.X("aspect:N", title="Product Aspect"),
                y=alt.Y("Mentions:Q", title="Total Mentions"),
                color=alt.Color("Sentiment:N", scale=alt.Scale(domain=["negative", "neutral", "positive"], range=["#EF4444", "#F59E0B", "#10B981"])),
                tooltip=["aspect", "Sentiment", "Mentions"]
            ).properties(height=340)
            st.altair_chart(absa_chart, use_container_width=True)

        st.markdown("---")
        st.subheader("📋 Sample Extracted Aspect Clauses")
        if not df_absa.empty:
            aspect_filter = st.selectbox("Filter by Aspect:", ["All"] + list(df_absa["aspect"].unique()))
            filtered_df = df_absa if aspect_filter == "All" else df_absa[df_absa["aspect"] == aspect_filter]
            st.dataframe(filtered_df[["aspect", "sentiment", "confidence", "keyword", "clause", "review_text"]].head(25), use_container_width=True)

    st.markdown("---")
    st.subheader("🧪 Interactive ABSA Tester")
    absa_analyzer = load_absa_analyzer()

    test_input = st.text_area(
        "Enter a review to extract aspects and sentiments:",
        value="The product quality is excellent, but delivery was slow and arrived late."
    )

    if st.button("Run Aspect Extraction", type="primary"):
        with st.spinner("Extracting aspects..."):
            res = absa_analyzer.analyze_review(test_input)
            aspects = res.get("aspects", {})

            if aspects:
                st.success(f"Found {len(aspects)} product aspect(s) in review!")
                for asp_name, asp_info in aspects.items():
                    color = "🟢" if asp_info["sentiment"] == "positive" else ("🔴" if asp_info["sentiment"] == "negative" else "🟡")
                    st.markdown(f"**{color} {asp_name}:** `{asp_info['sentiment'].upper()}` (Confidence: {asp_info['confidence']*100:.1f}%)")
                    st.caption(f"Matched keyword: `{asp_info['matched_keyword']}` | Supporting clause: *\"{asp_info['supporting_text']}\"*")
            else:
                st.info("No predefined aspects detected in this text.")


# ==============================================================================
# PAGE 4: CONSUMER INTELLIGENCE
# ==============================================================================
elif page == "💡 Consumer Intelligence":
    st.markdown('<div class="main-header">💡 Consumer Intelligence & Strategic Recommendations</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Converting Unstructured Customer Feedback into Actionable Product Decisions</div>', unsafe_allow_html=True)

    df_comp, df_praise, df_rec = load_consumer_insights()

    c1, c2 = st.columns(2)

    with c1:
        st.subheader("🚨 Recurring Customer Complaints")
        st.markdown("Clustered negative n-grams and root cause impact:")
        if not df_comp.empty:
            st.dataframe(df_comp, use_container_width=True)

    with c2:
        st.subheader("⭐ Frequently Praised Product Features")
        st.markdown("Key selling points and customer satisfaction drivers:")
        if not df_praise.empty:
            st.dataframe(df_praise, use_container_width=True)

    st.markdown("---")
    st.subheader("📊 Voice-of-Customer Frequency Distribution")
    chart_img = PROJECT_ROOT / "outputs" / "consumer_insights" / "complaints_vs_praises.png"
    if chart_img.exists():
        st.image(str(chart_img), caption="Frequency Distribution: Top 10 Complaints vs Praises", use_container_width=True)

    st.markdown("---")
    st.subheader("🎯 Actionable Strategic Recommendations")
    if not df_rec.empty:
        st.dataframe(df_rec, use_container_width=True)


# ==============================================================================
# PAGE 5: LIVE REVIEW PREDICTOR
# ==============================================================================
elif page == "🧪 Live Review Predictor":
    st.markdown('<div class="main-header">🧪 Live Review Sentiment Predictor</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Test Any Customer Review with DistilBERT, Logistic Regression, or Linear SVM</div>', unsafe_allow_html=True)

    predictor = load_sentiment_predictor()
    absa_analyzer = load_absa_analyzer()

    st.subheader("📝 Input Customer Review")

    col_btn1, col_btn2, col_btn3 = st.columns(3)
    sample_text = "This blender is fantastic! High quality motor, very easy to clean, but slightly expensive."
    if col_btn1.button("📌 Preset 1: Positive Quality & Usability"):
        sample_text = "Amazing purchase! The stainless steel build is sturdy and it cleans effortlessly."
    elif col_btn2.button("📌 Preset 2: Negative Durability & Price"):
        sample_text = "Complete waste of money. The cheap plastic gear broke after just two days of use."
    elif col_btn3.button("📌 Preset 3: Mixed Sentiment Review"):
        sample_text = "The product quality is top notch, but shipping was delayed by over two weeks."

    user_review = st.text_area("Review Text:", value=sample_text, height=110)

    model_choice = st.selectbox(
        "Select Model for Classification:",
        ["Compare All Models", "DistilBERT (Recommended)", "TF-IDF + Logistic Regression", "TF-IDF + Linear SVM"]
    )

    if st.button("Predict Sentiment", type="primary"):
        if not user_review.strip():
            st.warning("Please enter a review.")
        else:
            with st.spinner("Classifying sentiment..."):
                if model_choice == "Compare All Models":
                    results = predictor.predict_all(user_review)
                    st.subheader("🤖 Multi-Model Comparison")
                    cols = st.columns(len(results))
                    for i, (m_name, res) in enumerate(results.items()):
                        with cols[i]:
                            sentiment = res["sentiment"].upper()
                            conf = res["confidence"] * 100
                            badge_color = "#10B981" if sentiment == "POSITIVE" else ("#EF4444" if sentiment == "NEGATIVE" else "#F59E0B")
                            
                            st.markdown(f"""
                            <div class="metric-card">
                                <h4>{m_name}</h4>
                                <h2 style="color: {badge_color}; margin: 0.3rem 0;">{sentiment}</h2>
                                <p style="color: #64748B;">Confidence: <b>{conf:.1f}%</b></p>
                            </div>
                            """, unsafe_allow_html=True)

                            # Probability chart
                            prob_df = pd.DataFrame(list(res["probabilities"].items()), columns=["Sentiment", "Probability"])
                            prob_chart = alt.Chart(prob_df).mark_bar().encode(
                                x=alt.X("Sentiment:N"),
                                y=alt.Y("Probability:Q", scale=alt.Scale(domain=[0, 1])),
                                color=alt.Color("Sentiment:N", scale=alt.Scale(domain=["negative", "neutral", "positive"], range=["#EF4444", "#F59E0B", "#10B981"]))
                            ).properties(height=180)
                            st.altair_chart(prob_chart, use_container_width=True)

                else:
                    if "DistilBERT" in model_choice:
                        res = predictor.predict_distilbert(user_review)
                    elif "Logistic Regression" in model_choice:
                        res = predictor.predict_logistic_regression(user_review)
                    else:
                        res = predictor.predict_svm(user_review)

                    sentiment = res["sentiment"].upper()
                    conf = res["confidence"] * 100
                    st.success(f"**Predicted Sentiment:** {sentiment} (Confidence: {conf:.1f}%)")

            # Also run aspect breakdown
            st.markdown("---")
            st.subheader("🔍 Aspect Breakdown for this Review")
            absa_res = absa_analyzer.analyze_review(user_review)
            aspects = absa_res.get("aspects", {})
            if aspects:
                for asp, details in aspects.items():
                    s_color = "🟢" if details["sentiment"] == "positive" else ("🔴" if details["sentiment"] == "negative" else "🟡")
                    st.markdown(f"- {s_color} **{asp}:** `{details['sentiment'].upper()}` (Confidence: {details['confidence']*100:.1f}%) — *\"{details['supporting_text']}\"*")
            else:
                st.info("No specific product aspects matched.")
