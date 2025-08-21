# risk_alerts_user1.py
import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import requests

st.set_page_config(page_title="Personalized Risk Alerts (User 1)", layout="centered")
st.title("🚨 Personalized Retirement Risk Alerts (User 1)")

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
member = df.iloc[0]   # first user

st.subheader("👤 Selected User")
st.write(member[["User_ID", "Age", "Annual_Income", "Current_Savings", 
                 "Contribution_Amount", "Retirement_Age_Goal", "Monthly_Expenses"]])

# -----------------------------
# Risk Calculations
# -----------------------------
current_savings = member["Current_Savings"]
monthly_expenses = member.get("Monthly_Expenses", 0)
annual_withdrawal = monthly_expenses * 12
withdrawal_rate = annual_withdrawal / current_savings if current_savings > 0 else 0

SAFE_THRESHOLD = 0.04   # 4% rule
status = ""
if withdrawal_rate <= SAFE_THRESHOLD:
    status = "🟢 Safe"
elif withdrawal_rate <= 0.06:
    status = "🟡 Caution"
else:
    status = "🔴 Risky"

st.subheader("📉 Risk Analysis")
st.write(f"- Annual expenses (treated as withdrawals): **${annual_withdrawal:,.0f}**")
st.write(f"- Withdrawal rate: **{withdrawal_rate*100:.2f}%**")
st.write(f"- Risk status: **{status}**")

# -----------------------------
# Projection if withdrawals continue
# -----------------------------
years = 30   # simulate for 30 years
balance = current_savings
balances = []
for _ in range(years):
    balance = balance - annual_withdrawal  # ignoring growth for simplicity
    balances.append(balance if balance > 0 else 0)
    if balance <= 0:
        break

fig, ax = plt.subplots()
ax.plot(range(1, len(balances) + 1), balances, color="red")
ax.axhline(0, color="black", linestyle="--")
ax.set_xlabel("Years from Now")
ax.set_ylabel("Projected Balance ($)")
ax.set_title("Retirement Balance Projection (Based on Current Expenses)")
st.pyplot(fig)

# -----------------------------
# AI Insight
# -----------------------------
prompt = f"""
Member: {member['User_ID']}
Age: {member['Age']}, Current Savings: ${current_savings}, 
Annual Expenses (withdrawals): ${annual_withdrawal}, Withdrawal Rate: {withdrawal_rate:.2%}.
Risk Status: {status}.
Projection: Savings may last {len(balances)} years if current expenses continue.

Provide a 2–3 sentence personalized nudge to help this member manage expenses/withdrawals better.
"""

if st.button("🤖 Generate AI Nudge"):
    with st.spinner("Thinking..."):
        ai_response = ask_ollama(prompt)
        st.success(ai_response)

# -----------------------------
# Summary
# -----------------------------
st.subheader("📊 Summary")
st.write(f"- Withdrawal rate: **{withdrawal_rate*100:.2f}%** (Safe threshold: 4%)")
st.write(f"- Projected savings last: **{len(balances)} years**")
st.write(f"- Status: **{status}**")
