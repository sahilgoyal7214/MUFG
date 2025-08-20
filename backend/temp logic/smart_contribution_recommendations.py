# smart_contributions.py
import streamlit as st
import numpy as np
import matplotlib.pyplot as plt
import requests

st.set_page_config(page_title="Smart Contribution Recommendations", layout="centered")

st.title("💡 Smart Contribution Recommendations")

# -----------------------------
# Helper: Call Ollama API
# -----------------------------
def ask_ollama(prompt: str) -> str:
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={"model": "llama3", "prompt": prompt, "stream": False},  # you can swap "llama3" with "mistral"
            timeout=120
        )
        response.raise_for_status()
        data = response.json()
        return data.get("response", "⚠️ No response from Ollama.")
    except Exception as e:
        return f"⚠️ Ollama error: {str(e)}"

# -----------------------------
# Inputs
# -----------------------------
salary = st.number_input("Annual Salary ($)", min_value=10000, step=1000, value=60000)
current_contribution = st.number_input("Current Contribution (% of salary)", min_value=0, max_value=50, step=1, value=10)
goal_amount = st.number_input("Retirement Goal ($)", min_value=50000, step=10000, value=1000000)
years_to_retirement = st.slider("Years to Retirement", 5, 40, 25)
risk_tolerance = st.selectbox("Risk Tolerance", ["Low", "Medium", "High"])

# -----------------------------
# Simple model to simulate outcomes
# -----------------------------
def simulate_growth(contribution_rate, risk_tolerance):
    yearly_contribution = (contribution_rate / 100) * salary
    
    if risk_tolerance == "Low":
        r = 0.04
    elif risk_tolerance == "Medium":
        r = 0.06
    else:
        r = 0.08

    balance = 0
    balances = []
    for _ in range(years_to_retirement):
        balance = balance * (1 + r) + yearly_contribution
        balances.append(balance)
    return balances

# Current scenario
current_balances = simulate_growth(current_contribution, risk_tolerance)
# Suggested scenario: +5% contribution
suggested_contribution = min(current_contribution + 5, 50)
suggested_balances = simulate_growth(suggested_contribution, risk_tolerance)

# -----------------------------
# Visualization
# -----------------------------
fig, ax = plt.subplots()
ax.plot(range(1, years_to_retirement+1), current_balances, label=f"Current ({current_contribution}%)")
ax.plot(range(1, years_to_retirement+1), suggested_balances, label=f"Suggested ({suggested_contribution}%)", linestyle="--")
ax.axhline(goal_amount, color="red", linestyle=":", label="Goal")
ax.set_xlabel("Years")
ax.set_ylabel("Retirement Savings ($)")
ax.set_title("Contribution Scenarios")
ax.legend()
st.pyplot(fig)

# -----------------------------
# Gap analysis
# -----------------------------
current_final = current_balances[-1]
suggested_final = suggested_balances[-1]

if current_final >= goal_amount:
    message = "✅ You're on track to reach your retirement goal."
else:
    gap = goal_amount - current_final
    message = f"⚠️ You're projected to fall short by ${gap:,.0f} with current contributions."

# -----------------------------
# AI explanation via Ollama
# -----------------------------
prompt = f"""
User has a salary of ${salary}, contributing {current_contribution}% per year, with a retirement goal of ${goal_amount} in {years_to_retirement} years.
Their risk tolerance is {risk_tolerance}.
Current projection = ${current_final:,.0f}.
If they increase contributions to {suggested_contribution}%, projection = ${suggested_final:,.0f}.
Write a short financial recommendation in plain English (2-3 sentences).
"""

if st.button("Generate AI Recommendation"):
    with st.spinner("🤖 Thinking... generating recommendation..."):
        ai_response = ask_ollama(prompt)
        st.success(ai_response)

# -----------------------------
# Numeric summary
# -----------------------------
st.subheader("📊 Summary")
st.write(message)
st.write(f"- Final balance with {current_contribution}% contributions: **${current_final:,.0f}**")
st.write(f"- Final balance with {suggested_contribution}% contributions: **${suggested_final:,.0f}**")
