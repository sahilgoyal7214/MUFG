# what_if_simulator_user1.py
import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import requests
import re

st.set_page_config(page_title="What-If Simulator (User 1)", layout="centered")
st.title("🔮 What-If Retirement Simulator (User 1)")

# -----------------------------
# Helper: Call Ollama API
# -----------------------------
def ask_ollama(prompt: str) -> str:
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={"model": "mistral", "prompt": prompt, "stream": False},
            timeout=120
        )
        response.raise_for_status()
        return response.json().get("response", "⚠️ No response from Ollama.")
    except Exception as e:
        return f"⚠️ Ollama error: {str(e)}"

# -----------------------------
# Load data & pick first user
# -----------------------------
@st.cache_data
def load_data():
    return pd.read_excel("Copy of Usecase 5(1).xlsx", sheet_name="Usecase 5 data")

df = load_data()
member = df.iloc[0]   # <-- first user in dataset

st.subheader("👤 Selected User")
st.write(member[["User_ID", "Age", "Annual_Income", "Current_Savings", 
                 "Contribution_Amount", "Retirement_Age_Goal"]])

# -----------------------------
# Parameters from user data
# -----------------------------
salary = member["Annual_Income"]
contribution_rate = (member["Contribution_Amount"] / salary) * 100   # % contribution
retirement_age = int(member["Retirement_Age_Goal"])
current_age = int(member["Age"])

market_scenario = st.selectbox("Market Scenario", ["Conservative", "Moderate", "Aggressive"], index=1)
inflation_adjusted = st.checkbox("Adjust for Inflation (2%)", value=True)

# -----------------------------
# Simulation function
# -----------------------------
def simulate_growth(contribution_rate, retirement_age, market_scenario, inflation):
    years_to_retirement = retirement_age - current_age
    yearly_contribution = (contribution_rate / 100) * salary
    
    if market_scenario == "Conservative":
        r = 0.04
    elif market_scenario == "Moderate":
        r = 0.06
    else:
        r = 0.08

    if inflation:
        r -= 0.02

    balance = member["Current_Savings"]
    balances = []
    for _ in range(years_to_retirement):
        balance = balance * (1 + r) + yearly_contribution
        balances.append(balance)
    return balances

# Baseline projection
baseline_balances = simulate_growth(contribution_rate, retirement_age, market_scenario, inflation_adjusted)

# -----------------------------
# What-if scenario (AI parsing)
# -----------------------------
st.subheader("💭 Ask a What-If Question")
user_question = st.text_input("Example: 'What if I retire at 55 instead of 60?'")

whatif_balances = None
new_retirement_age = retirement_age

if st.button("Run What-If Scenario"):
    with st.spinner("Analyzing with AI..."):
        ai_text = ask_ollama(f"Extract retirement age or contribution changes from this question: {user_question}. "
                             f"Reply strictly in format: retirement_age=XX or contribution_rate=YY")
        
        # Try extracting numbers
        match_age = re.search(r"retirement_age\s*=\s*(\d+)", ai_text)
        match_contrib = re.search(r"contribution_rate\s*=\s*(\d+)", ai_text)
        
        if match_age:
            new_retirement_age = int(match_age.group(1))
        if match_contrib:
            contribution_rate = float(match_contrib.group(1))
        
        whatif_balances = simulate_growth(contribution_rate, new_retirement_age, market_scenario, inflation_adjusted)

        # -----------------------------
        # Plot comparison
        # -----------------------------
        fig, ax = plt.subplots()
        ax.plot(range(1, len(baseline_balances) + 1), baseline_balances, label=f"Baseline (Retire @ {retirement_age})")
        ax.plot(range(1, len(whatif_balances) + 1), whatif_balances, label=f"What-If (Retire @ {new_retirement_age})", linestyle="--")
        ax.set_xlabel("Years to Retirement")
        ax.set_ylabel("Projected Savings ($)")
        ax.set_title("Baseline vs What-If Scenario")
        ax.legend()
        st.pyplot(fig)

        # AI Insight
        final_baseline = baseline_balances[-1]
        final_whatif = whatif_balances[-1]
        delta = final_whatif - final_baseline

        insight_prompt = f"""
        Member {member['User_ID']} currently retires at {retirement_age} with ${final_baseline:,.0f}.
        What-if scenario: retire at {new_retirement_age} with ${final_whatif:,.0f}.
        Difference = {delta:,.0f}.
        Give a short 2–3 sentence comparison insight.
        """

        ai_insight = ask_ollama(insight_prompt)
        st.success(ai_insight)
