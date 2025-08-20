# advisor_segmentation.py
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import json
import requests

st.set_page_config(page_title="Advisor – Member Segmentation", layout="wide")
st.title("👥 Advisor: Member Segmentation for Tailored Advice")

# -----------------------------
# Helper: Call Ollama API
# -----------------------------
def ask_ollama(prompt: str) -> str:
    try:
        resp = requests.post(
            "http://localhost:11434/api/generate",
            json={"model": "mistral", "prompt": prompt, "stream": False},
            timeout=120
        )
        resp.raise_for_status()
        return resp.json().get("response", "⚠️ No response from Ollama.")
    except Exception as e:
        return f"⚠️ Ollama error: {str(e)}"

# -----------------------------
# Load Data
# -----------------------------
@st.cache_data
def load_data():
    return pd.read_excel("Copy of Usecase 5(1).xlsx", sheet_name="Usecase 5 data")

df = load_data()

# Basic checks & cleanup
needed_cols = [
    "User_ID", "Age", "Annual_Income", "Current_Savings", "Risk_Tolerance"
]
missing = [c for c in needed_cols if c not in df.columns]
if missing:
    st.error(f"Missing required columns in your sheet: {missing}")
    st.stop()

# Keep only rows with complete required fields
df_clean = df.dropna(subset=needed_cols).copy()

# Encode Risk_Tolerance
risk_map = {"Low": 1, "Medium": 2, "High": 3}
df_clean["Risk_Tolerance_Num"] = df_clean["Risk_Tolerance"].map(risk_map).fillna(2)

# Optional: sidebar filters to focus segmentation
st.sidebar.header("Filters")
age_min, age_max = int(df_clean["Age"].min()), int(df_clean["Age"].max())
age_range = st.sidebar.slider("Age range", min_value=age_min, max_value=age_max,
                              value=(age_min, age_max))
income_min, income_max = float(df_clean["Annual_Income"].min()), float(df_clean["Annual_Income"].max())
income_range = st.sidebar.slider("Annual Income range ($)", min_value=float(income_min),
                                 max_value=float(income_max), value=(float(income_min), float(income_max)))

risk_filter = st.sidebar.multiselect("Risk Tolerance", ["Low", "Medium", "High"],
                                     default=["Low", "Medium", "High"])

mask = (
    (df_clean["Age"].between(age_range[0], age_range[1])) &
    (df_clean["Annual_Income"].between(income_range[0], income_range[1])) &
    (df_clean["Risk_Tolerance"].isin(risk_filter))
)
data = df_clean.loc[mask].copy()

st.caption(f"Showing **{len(data)}** members after filters.")

# -----------------------------
# KMeans Segmentation
# -----------------------------
features = data[["Age", "Annual_Income", "Current_Savings", "Risk_Tolerance_Num"]].copy()

# Standardize (robust fallback if sklearn missing)
try:
    from sklearn.preprocessing import StandardScaler
    from sklearn.cluster import KMeans
    scaler = StandardScaler()
    X = scaler.fit_transform(features.values)
    sklearn_ok = True
except Exception:
    # Manual standardization
    mu = features.mean()
    sigma = features.std().replace(0, 1)
    X = ((features - mu) / sigma).values
    sklearn_ok = False

st.sidebar.header("Segmentation Settings")
k = st.sidebar.slider("Number of clusters (k)", 2, 6, 4)

if sklearn_ok:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)  # fixed here
    labels = kmeans.fit_predict(X)
else:
    # Very small fallback: pick k random centroids and do a few iterations
    rng = np.random.RandomState(42)
    centroids = X[rng.choice(len(X), size=k, replace=False)]
    for _ in range(10):
        dists = ((X[:, None, :] - centroids[None, :, :]) ** 2).sum(axis=2)
        labels = dists.argmin(axis=1)
        for ci in range(k):
            pts = X[labels == ci]
            if len(pts):
                centroids[ci] = pts.mean(axis=0)

data["Cluster"] = labels

# -----------------------------
# Cluster Profiles
# -----------------------------
profile_cols = ["Age", "Annual_Income", "Current_Savings", "Risk_Tolerance_Num"]
cluster_profile = (
    data.groupby("Cluster")[profile_cols]
    .agg(["mean", "median", "min", "max"])
    .round(2)
)
cluster_counts = data["Cluster"].value_counts().sort_index()
cluster_profile["count"] = cluster_counts

st.subheader("📊 Cluster Profiles")
st.dataframe(cluster_profile)

# -----------------------------
# Visualization
# -----------------------------
st.subheader("📈 Income vs. Savings by Cluster")
fig = px.scatter(
    data,
    x="Annual_Income",
    y="Current_Savings",
    color=data["Cluster"].astype(str),
    hover_data=["User_ID", "Age", "Risk_Tolerance"],
    labels={"color": "Cluster"},
    title="Member Segments"
)
st.plotly_chart(fig, use_container_width=True)

# Optional second view: Age vs. Savings
with st.expander("Show Age vs. Savings"):
    fig2 = px.scatter(
        data,
        x="Age",
        y="Current_Savings",
        color=data["Cluster"].astype(str),
        hover_data=["User_ID", "Annual_Income", "Risk_Tolerance"],
        labels={"color": "Cluster"},
        title="Age vs. Savings by Cluster"
    )
    st.plotly_chart(fig2, use_container_width=True)

# -----------------------------
# Quick Labels for Clusters (rule-of-thumb)
# -----------------------------
def label_cluster(row):
    inc = row[("Annual_Income", "mean")]
    sav = row[("Current_Savings", "mean")]
    risk = row[("Risk_Tolerance_Num", "mean")]
    # Simple heuristics
    if sav >= data["Current_Savings"].median() and inc >= data["Annual_Income"].median():
        return "High Capacity Savers"
    if sav < data["Current_Savings"].median() and inc >= data["Annual_Income"].median():
        return "High Income, Low Savings"
    if risk >= 2.5 and sav < data["Current_Savings"].median():
        return "Aggressive & Underfunded"
    if risk <= 1.5 and sav >= data["Current_Savings"].median():
        return "Conservative & Funded"
    return "Balanced"

cluster_labels = {}
for c in cluster_profile.index:
    cluster_labels[int(c)] = label_cluster(cluster_profile.loc[c])

st.subheader("🏷️ Suggested Cluster Labels")
st.write({f"Cluster {k}": v for k, v in cluster_labels.items()})

# -----------------------------
# AI: Advisor Actions per Cluster
# -----------------------------
if st.button("🔍 Generate Advisor Actions with AI"):
    with st.spinner("Thinking... 🤖"):
        # Build a concise summary for AI
        summary = []
        for c in cluster_profile.index:
            entry = {
                "cluster": int(c),
                "label": cluster_labels[int(c)],
                "count": int(cluster_profile.loc[c, "count"]),
                "age_mean": float(cluster_profile.loc[c, ("Age", "mean")]),
                "income_mean": float(cluster_profile.loc[c, ("Annual_Income", "mean")]),
                "savings_mean": float(cluster_profile.loc[c, ("Current_Savings", "mean")]),
                "risk_mean": float(cluster_profile.loc[c, ("Risk_Tolerance_Num", "mean")])
            }
            summary.append(entry)

        prompt = f"""
You are an experienced pension advisor. I clustered members into {k} segments.
Each item has: cluster id, heuristic label, member count, average age, income, savings, and risk score (1=Low,2=Medium,3=High).

Clusters summary (JSON):
{json.dumps(summary, indent=2)}

For each cluster:
1) Describe member profile in one line.
2) Give 2-3 concrete advisor actions (e.g., contribution nudges, allocation tilts, risk counseling).
3) Flag urgent risks if any (e.g., low savings + high risk).
Keep it crisp and actionable.
"""
        ai_text = ask_ollama(prompt)
        st.markdown("### 🤖 Advisor Playbook by Segment")
        st.write(ai_text)

# -----------------------------
# Drilldown: Members in a Cluster
# -----------------------------
st.subheader("🔎 Drill Down by Cluster")
sel_cluster = st.selectbox("Select cluster to inspect", sorted(data["Cluster"].unique()))
cluster_view = data[data["Cluster"] == sel_cluster][
    ["User_ID", "Age", "Annual_Income", "Current_Savings", "Risk_Tolerance"]
].sort_values("Current_Savings", ascending=False)
st.dataframe(cluster_view, use_container_width=True)

st.caption("Tip: Use filters (left sidebar) to focus on specific cohorts before clustering.")
