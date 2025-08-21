# advisor_portfolio_optimization.py
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import requests

st.set_page_config(page_title="Advisor – Portfolio Optimization", layout="wide")
st.title("📈 Advisor: Portfolio Optimization Suggestions")

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

# Columns we’ll try to use; we’ll be resilient if something is missing
needed = ["User_ID", "Age", "Risk_Tolerance", "Pension_Type", "Withdrawal_Strategy",
          "Current_Savings", "Annual_Income", "Investment_Type", "Retirement_Age_Goal"]
for col in needed:
    if col not in df.columns:
        df[col] = np.nan  # create missing columns so the app doesn't crash

# Basic cleaning
df["Age"] = pd.to_numeric(df["Age"], errors="coerce")
df["Current_Savings"] = pd.to_numeric(df["Current_Savings"], errors="coerce")
df["Annual_Income"] = pd.to_numeric(df["Annual_Income"], errors="coerce")
df["Retirement_Age_Goal"] = pd.to_numeric(df["Retirement_Age_Goal"], errors="coerce")
df["Risk_Tolerance"] = df["Risk_Tolerance"].fillna("Medium")
df["Pension_Type"] = df["Pension_Type"].fillna("Defined Contribution")
df["Withdrawal_Strategy"] = df["Withdrawal_Strategy"].fillna("Fixed")
df["Investment_Type"] = df["Investment_Type"].fillna("Mixed")

valid_rows = df.dropna(subset=["User_ID", "Age"])
if valid_rows.empty:
    st.error("No valid member rows found. Please check your sheet.")
    st.stop()

# -----------------------------
# Sidebar – Select Member
# -----------------------------
st.sidebar.header("Member Selector")
user_id = st.sidebar.selectbox("Choose Member", valid_rows["User_ID"].astype(str).unique())
member = valid_rows[valid_rows["User_ID"].astype(str) == str(user_id)].iloc[0]

# -----------------------------
# Display Member Snapshot
# -----------------------------
col1, col2, col3 = st.columns(3)
with col1:
    st.metric("User ID", str(member.get("User_ID", "")))
    st.metric("Age", int(member.get("Age", 0)) if not pd.isna(member.get("Age", np.nan)) else "-")
with col2:
    st.metric("Risk Tolerance", str(member.get("Risk_Tolerance", "Medium")))
    st.metric("Pension Type", str(member.get("Pension_Type", "-")))
with col3:
    st.metric("Withdrawal Strategy", str(member.get("Withdrawal_Strategy", "-")))
    st.metric("Current Savings ($)", f"{float(member.get('Current_Savings', 0)):,.0f}")

# -----------------------------
# Heuristic Recommendation Engine
# -----------------------------
def recommend_allocation(age: float,
                         risk: str = "Medium",
                         pension_type: str = "Defined Contribution",
                         withdrawal_strategy: str = "Fixed",
                         retirement_age_goal: float = 65.0):
    """
    Returns a dict: {'Stocks': pct, 'Bonds': pct, 'Cash': pct} summing to 100.
    Rule-of-thumb glide path + risk tilt + withdrawal/pension adjustments.
    """
    # Base equity by risk
    risk = (risk or "Medium").strip().title()
    base_equity = {"Low": 0.40, "Medium": 0.60, "High": 0.75}.get(risk, 0.60)

    # Age-based glide path: reduce equity as age increases (soft slope)
    # Roughly -0.5% equity per year after age 30
    glide_adj = max(0, (age - 30) * 0.005)
    equity = max(0.25, min(0.90, base_equity - glide_adj))

    # Withdrawal strategy: Flexible favors slightly more equity; Fixed/Guaranteed favors less
    ws = (withdrawal_strategy or "Fixed").strip().title()
    if ws in ["Flexible", "Dynamic"]:
        equity += 0.03
    elif ws in ["Fixed", "Bucket"]:
        equity -= 0.03

    # Pension type: Defined Benefit acts like bond-like floor -> slightly more equity possible
    pt = (pension_type or "Defined Contribution").strip().title()
    if "Defined Benefit" in pt:
        equity += 0.03
    elif "Defined Contribution" in pt:
        equity += 0.00
    else:
        equity += 0.00

    # Near retirement: dampen equity if within 7 years of goal
    if not pd.isna(retirement_age_goal) and not pd.isna(age):
        years_to_ret = max(0, float(retirement_age_goal) - float(age))
        if years_to_ret <= 7:
            equity -= 0.05

    equity = float(np.clip(equity, 0.15, 0.90))
    # Split remainder between bonds & cash (more cash when older or low risk)
    remainder = 1.0 - equity
    # Cash tilt
    cash_base = 0.10
    if age >= 55:
        cash_base += 0.05
    if risk == "Low":
        cash_base += 0.05
    cash = float(np.clip(cash_base, 0.05, 0.25))
    bonds = float(max(0.0, remainder - cash))

    # Normalize to 100%
    total = equity + bonds + cash
    equity /= total; bonds /= total; cash /= total

    return {
        "Stocks": round(equity * 100, 1),
        "Bonds": round(bonds * 100, 1),
        "Cash": round(cash * 100, 1),
    }

# -----------------------------
# Estimate Current Allocation (from Investment_Type) + allow edits
# -----------------------------
def guess_current_allocation(investment_type: str):
    it = (investment_type or "Mixed").strip().lower()
    if "bond" in it:
        return {"Stocks": 20.0, "Bonds": 70.0, "Cash": 10.0}
    if "equity" in it or "stock" in it:
        return {"Stocks": 70.0, "Bonds": 20.0, "Cash": 10.0}
    if "balanced" in it or "mixed" in it or "fund" in it:
        return {"Stocks": 50.0, "Bonds": 40.0, "Cash": 10.0}
    return {"Stocks": 50.0, "Bonds": 40.0, "Cash": 10.0}

st.subheader("📐 Current vs Recommended Allocation")
left, right = st.columns(2)

with left:
    st.caption("Current Allocation (editable)")
    guess = guess_current_allocation(member.get("Investment_Type", "Mixed"))
    c_stocks = st.number_input("Stocks % (current)", min_value=0.0, max_value=100.0, step=1.0, value=float(guess["Stocks"]))
    c_bonds  = st.number_input("Bonds % (current)",  min_value=0.0, max_value=100.0, step=1.0, value=float(guess["Bonds"]))
    c_cash   = st.number_input("Cash % (current)",   min_value=0.0, max_value=100.0, step=1.0, value=float(guess["Cash"]))
    # Normalize if sum != 100
    c_sum = c_stocks + c_bonds + c_cash
    if c_sum == 0:
        c_stocks, c_bonds, c_cash = 50.0, 40.0, 10.0
        c_sum = 100.0
    c_stocks, c_bonds, c_cash = (x / c_sum * 100.0 for x in (c_stocks, c_bonds, c_cash))
    current_alloc = {"Stocks": round(c_stocks, 1), "Bonds": round(c_bonds, 1), "Cash": round(c_cash, 1)}
    st.write(f"Sum: **{round(sum(current_alloc.values()),1)}%**")

with right:
    st.caption("Recommended Allocation (auto)")
    rec = recommend_allocation(
        age=float(member.get("Age", 0) or 0),
        risk=str(member.get("Risk_Tolerance", "Medium")),
        pension_type=str(member.get("Pension_Type", "Defined Contribution")),
        withdrawal_strategy=str(member.get("Withdrawal_Strategy", "Fixed")),
        retirement_age_goal=float(member.get("Retirement_Age_Goal", 65) or 65)
    )
    st.write(rec)

# -----------------------------
# Charts: Side-by-side comparison
# -----------------------------
viz1, viz2 = st.columns(2)
with viz1:
    df_current = pd.DataFrame({"Asset Class": list(current_alloc.keys()), "Percent": list(current_alloc.values())})
    fig_current = px.bar(df_current, x="Asset Class", y="Percent", title="Current Allocation", text="Percent", range_y=[0,100])
    st.plotly_chart(fig_current, use_container_width=True)

with viz2:
    df_rec = pd.DataFrame({"Asset Class": list(rec.keys()), "Percent": list(rec.values())})
    fig_rec = px.bar(df_rec, x="Asset Class", y="Percent", title="Recommended Allocation", text="Percent", range_y=[0,100])
    st.plotly_chart(fig_rec, use_container_width=True)

# Delta table
st.subheader("🔎 Rebalance Deltas")
delta = {k: round(rec[k] - current_alloc.get(k, 0.0), 1) for k in rec.keys()}
st.table(pd.DataFrame({
    "Asset Class": list(delta.keys()),
    "Change Needed (pp)": list(delta.values())
}))

# -----------------------------
# AI: Advisor Explanation
# -----------------------------
if st.button("🤖 Generate Advisor Rationale"):
    with st.spinner("Thinking..."):
        prompt = f"""
You are a portfolio strategist for retirement plans.

Member Profile:
- Age: {member.get('Age')}
- Risk Tolerance: {member.get('Risk_Tolerance')}
- Pension Type: {member.get('Pension_Type')}
- Withdrawal Strategy: {member.get('Withdrawal_Strategy')}
- Current Savings: ${member.get('Current_Savings')}
- Current Allocation: {current_alloc}
- Recommended Allocation: {rec}

Explain in 3–5 sentences:
1) Why this recommended mix balances growth vs. safety for this member.
2) The main risks if they keep current allocation.
3) A simple next-step (rebalance suggestion).
Keep it crisp, professional, and client-friendly.
"""
        ai_text = ask_ollama(prompt)
        st.markdown("### 🧠 Advisor Rationale")
        st.write(ai_text)

# -----------------------------
# Notes
# -----------------------------
with st.expander("Notes on the Recommendation Engine"):
    st.markdown("""
- Uses a **risk-based equity baseline**, then applies an **age glide path** (slightly reduces equity as age increases).
- Adjusts for **Withdrawal Strategy** (Fixed/Dynamic) and **Pension Type** (DB allows a bit more equity due to income floor).
- Adds a de-risking tilt when **within ~7 years** of retirement age goal.
- These are **heuristics** (good defaults). Advisors can override based on total picture (tax, outside assets, liabilities).
""")
