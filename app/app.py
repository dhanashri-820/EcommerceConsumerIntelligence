"""
EcommerceConsumerIntelligence Analytics & Business Intelligence Dashboard
Streamlit Enterprise Application with Customer Segmentation, Churn Prediction,
Cohort Retention, Demand Forecasting, and Multi-Model Sentiment Analysis.
"""

from pathlib import Path
import sys
import numpy as np
import pandas as pd
import streamlit as st
import altair as alt
import matplotlib.pyplot as plt
import seaborn as sns

# Add src to system path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR / "src"))

from data_processing import load_dataset, clean_review_data, summarize_dataset
from customer_analytics import compute_rfm_segments, compute_cohort_retention, compute_market_basket
from churn_model import build_churn_features, train_churn_models
from forecasting import prepare_time_series, forecast_demand
from sentiment_predictor import SentimentPredictor

st.set_page_config(
    page_title="ConsumerIQ · E-Commerce Intelligence",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .main-kpi-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .kpi-title { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; }
    .kpi-val { font-size: 26px; font-weight: 800; color: #0f172a; font-family: monospace; }
</style>
""", unsafe_allow_html=True)


@st.cache_data
def get_cleaned_data(domain_file: str):
    path = ROOT_DIR / "data" / "processed" / domain_file
    raw = load_dataset(path)
    return clean_review_data(raw)


# Sidebar Configuration
st.sidebar.title("ConsumerIQ Analytics")
domain_options = {
    "Home & Kitchen (15k)": "home_kitchen_balanced.csv",
    "Appliances (15k)": "appliances_balanced.csv",
    "Sports & Outdoors (15k)": "sports_outdoors_balanced.csv"
}
selected_domain = st.sidebar.selectbox("Retail Domain", list(domain_options.keys()))
csv_file = domain_options[selected_domain]

df = get_cleaned_data(csv_file)
min_date = df['datetime'].min().date()
max_date = df['datetime'].max().date()

date_range = st.sidebar.date_input("Filter Date Range", [min_date, max_date], min_value=min_date, max_value=max_date)
if len(date_range) == 2:
    df = df[(df['datetime'].dt.date >= date_range[0]) & (df['datetime'].dt.date <= date_range[1])]

sentiment_filter = st.sidebar.multiselect("Sentiment Filter", ["positive", "neutral", "negative"], default=["positive", "neutral", "negative"])
df = df[df['sentiment'].isin(sentiment_filter)]

# Main Dashboard Navigation
tabs = st.tabs([
    "📈 Executive Overview",
    "👥 Customer Segmentation (RFM)",
    "⚠️ Churn Risk & Retention",
    "🔮 90-Day Demand Forecast",
    "🛒 Market Basket & Products",
    "🧠 Live ML Predictor"
])

# ── TAB 1: EXECUTIVE OVERVIEW ──────────────────────────────────────────────────
with tabs[0]:
    st.subheader("Executive KPI Summary")
    summary = summarize_dataset(df)
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown(f"""<div class='main-kpi-card'><div class='kpi-title'>Total Reviews Analyzed</div><div class='kpi-val'>{summary['total_reviews']:,}</div></div>""", unsafe_allow_html=True)
    with col2:
        st.markdown(f"""<div class='main-kpi-card'><div class='kpi-title'>Unique Active Customers</div><div class='kpi-val'>{summary['unique_users']:,}</div></div>""", unsafe_allow_html=True)
    with col3:
        st.markdown(f"""<div class='main-kpi-card'><div class='kpi-title'>Catalog ASINs Evaluated</div><div class='kpi-val'>{summary['unique_products']:,}</div></div>""", unsafe_allow_html=True)
    with col4:
        st.markdown(f"""<div class='main-kpi-card'><div class='kpi-title'>Average Star Rating</div><div class='kpi-val'>★ {summary['avg_rating']}</div></div>""", unsafe_allow_html=True)

    st.markdown("---")
    c1, c2 = st.columns([1, 1])
    with c1:
        st.markdown("##### Sentiment Distribution")
        sent_counts = df['sentiment'].value_counts().reset_index()
        sent_counts.columns = ['Sentiment', 'Count']
        chart = alt.Chart(sent_counts).mark_bar(cornerRadius=4).encode(
            x=alt.X('Sentiment:N', sort=['positive', 'neutral', 'negative']),
            y='Count:Q',
            color=alt.Color('Sentiment:N', scale=alt.Scale(domain=['positive', 'neutral', 'negative'], range=['#10b981', '#f59e0b', '#ef4444']))
        ).properties(height=280)
        st.altair_chart(chart, use_container_width=True)

    with c2:
        st.markdown("##### Rating Distribution (1 to 5 Stars)")
        rating_counts = df['rating'].value_counts().sort_index().reset_index()
        rating_counts.columns = ['Rating', 'Reviews']
        r_chart = alt.Chart(rating_counts).mark_bar(color='#6366f1', cornerRadius=4).encode(
            x='Rating:O',
            y='Reviews:Q'
        ).properties(height=280)
        st.altair_chart(r_chart, use_container_width=True)

# ── TAB 2: RFM CUSTOMER SEGMENTATION ──────────────────────────────────────────
with tabs[1]:
    st.subheader("Customer Segmentation (Recency-Frequency-Verification + K-Means)")
    st.markdown("Identifies actionable customer personas using log-scaled RFV behavioral clusters.")

    user_rfm, profiles = compute_rfm_segments(df, n_clusters=4, random_state=42)

    colA, colB = st.columns([1.2, 1])
    with colA:
        rfm_scatter = alt.Chart(user_rfm).mark_circle(size=60, opacity=0.7).encode(
            x=alt.X('recency_days:Q', title='Recency (Days since last activity)'),
            y=alt.Y('frequency:Q', title='Frequency (Reviews count)', scale=alt.Scale(type='log')),
            color=alt.Color('segment_name:N', title='Persona'),
            tooltip=['user_id', 'segment_name', 'recency_days', 'frequency', 'avg_rating']
        ).properties(height=350).interactive()
        st.altair_chart(rfm_scatter, use_container_width=True)

    with colB:
        st.markdown("##### Segment Strategic Recommendations")
        for cid, prof in profiles.items():
            with st.expander(f"Cluster {cid}: {prof['persona']}", expanded=True):
                st.write(f"**Metrics:** Avg Recency: {prof['avg_recency']} | Avg Freq: {prof['avg_frequency']} | Rating: {prof['avg_rating']}")
                st.info(f"**Strategy:** {prof['recommendation']}")

# ── TAB 3: CHURN RISK & COHORT RETENTION ───────────────────────────────────────
with tabs[2]:
    st.subheader("Predictive Churn Modeling & Cohort Retention")

    tab_sub1, tab_sub2 = st.tabs(["Churn Machine Learning Model", "Quarterly Cohort Heatmap"])
    
    with tab_sub1:
        churn_df = build_churn_features(df, inactivity_days_threshold=730)
        churn_results = train_churn_models(churn_df, random_state=42)
        lr_res = churn_results['baseline_lr']
        rf_res = churn_results['improved_rf']

        k1, k2, k3, k4 = st.columns(4)
        k1.metric("Baseline Logistic ROC-AUC", f"{lr_res['roc_auc']:.3f}")
        k2.metric("Random Forest ROC-AUC", f"{rf_res['roc_auc']:.3f}", delta=f"+{(rf_res['roc_auc'] - lr_res['roc_auc']):.3f}")
        k3.metric("Random Forest F1-Score", f"{rf_res['f1_score']:.3f}")
        k4.metric("5-Fold CV ROC-AUC", f"{rf_res['cv_roc_auc']:.3f}")

        st.markdown("---")
        c_left, c_right = st.columns([1, 1])
        with c_left:
            st.markdown("##### Top Predictive Feature Importances")
            feat_df = pd.DataFrame(list(rf_res['feature_importances'].items()), columns=['Feature', 'Importance']).sort_values('Importance', ascending=False)
            feat_chart = alt.Chart(feat_df).mark_bar(color='#4f46e5', cornerRadius=4).encode(
                x='Importance:Q',
                y=alt.Y('Feature:N', sort='-x')
            ).properties(height=280)
            st.altair_chart(feat_chart, use_container_width=True)

        with c_right:
            st.markdown("##### Interactive Customer Churn Scorer")
            with st.form("churn_scorer"):
                in_tenure = st.number_input("Customer Tenure (Days)", min_value=1, value=180)
                in_freq = st.number_input("Lifetime Reviews / Orders", min_value=1, value=3)
                in_rating = st.slider("Average Rating Given", min_value=1.0, max_value=5.0, value=3.5, step=0.1)
                in_helpful = st.number_input("Helpful Votes Received", min_value=0, value=2)
                in_neg = st.number_input("Negative Reviews Authored", min_value=0, value=1)
                submit_btn = st.form_submit_button("Predict Churn Probability")

                if submit_btn:
                    test_vec = np.array([[in_tenure, in_freq, in_freq/in_tenure, in_rating, 0.0, 1.0, in_helpful, in_neg]])
                    churn_prob = churn_results['models']['rf'].predict_proba(test_vec)[0, 1]
                    if churn_prob > 0.5:
                        st.error(f"⚠️ High Risk of Churn: {churn_prob*100:.1f}% probability")
                    else:
                        st.success(f"✅ Healthy Active Customer: {(1-churn_prob)*100:.1f}% retention probability")

    with tab_sub2:
        st.markdown("##### Customer Activity Cohort Retention Table (%)")
        cohort_matrix = compute_cohort_retention(df, freq='Q')
        st.dataframe(cohort_matrix.iloc[-8:, :6].style.background_gradient(cmap='Blues', axis=1))

# ── TAB 4: 90-DAY TIME SERIES FORECAST ─────────────────────────────────────────
with tabs[3]:
    st.subheader("90-Day Time-Series Demand & Review Volume Forecast")
    ts = prepare_time_series(df, freq='W')
    forecast_df = forecast_demand(ts, horizon_periods=12)

    chart_hist = pd.DataFrame({
        'Date': ts.index[-40:],
        'Weekly Reviews': ts['review_count'][-40:],
        'Series': 'Observed'
    })
    chart_fc = pd.DataFrame({
        'Date': forecast_df.index,
        'Weekly Reviews': forecast_df['forecast'],
        'Series': 'Forecast (Next 90 Days)'
    })
    combined_ts = pd.concat([chart_hist, chart_fc])

    ts_chart = alt.Chart(combined_ts).mark_line(point=True).encode(
        x='Date:T',
        y='Weekly Reviews:Q',
        color=alt.Color('Series:N', scale=alt.Scale(domain=['Observed', 'Forecast (Next 90 Days)'], range=['#0284c7', '#e11d48']))
    ).properties(height=380)
    st.altair_chart(ts_chart, use_container_width=True)

# ── TAB 5: MARKET BASKET ANALYSIS ─────────────────────────────────────────────
with tabs[4]:
    st.subheader("Cross-Selling Market Basket Co-occurrences")
    basket = compute_market_basket(df, min_support=2, top_n=15)
    if len(basket) > 0:
        st.markdown("Frequently Co-Reviewed & Associated ASIN Product Pairs:")
        st.dataframe(basket.rename(columns={'asin_x': 'Product A (ASIN)', 'asin_y': 'Product B (ASIN)', 'co_review_count': 'Co-occurrence Frequency'}))
    else:
        st.info("No co-occurrence pairs exceeding support threshold found in current domain slice.")

# ── TAB 6: LIVE ML MODEL INFERENCE ───────────────────────────────────────────
with tabs[5]:
    st.subheader("Side-by-Side Model Inference Engine")
    input_text = st.text_area("Input a customer review for evaluation:", "The material is sturdy and high quality, but the shipping arrived late in a damaged box.")
    
    if st.button("Run Multi-Model Prediction", type="primary"):
        predictor = SentimentPredictor(models_dir=str(ROOT_DIR / "models"))
        pred = predictor.predict(input_text, model="all")
        
        m1, m2, m3 = st.columns(3)
        with m1:
            st.metric("TF-IDF + Logistic Regression", pred['logistic_regression']['sentiment'].upper(), f"{pred['logistic_regression']['confidence']*100:.1f}%")
        with m2:
            st.metric("TF-IDF + Linear SVM", pred['linear_svm']['sentiment'].upper(), f"{pred['linear_svm']['confidence']*100:.1f}%")
        with m3:
            st.metric("DistilBERT Transformer", pred['distilbert']['sentiment'].upper(), f"{pred['distilbert']['confidence']*100:.1f}% ★")
