-- SQLite Migration: Create pension_data table
-- Date: 2025-08-18
-- Description: Main table for storing comprehensive pension member data

CREATE TABLE IF NOT EXISTS pension_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT UNIQUE NOT NULL,
  
  -- Personal Information
  age INTEGER,
  gender TEXT,
  country TEXT,
  employment_status TEXT,
  marital_status TEXT,
  number_of_dependents INTEGER,
  education_level TEXT,
  health_status TEXT,
  life_expectancy_estimate INTEGER,
  
  -- Financial Information
  annual_income INTEGER,
  current_savings INTEGER,
  debt_level INTEGER,
  monthly_expenses INTEGER,
  savings_rate REAL,
  home_ownership_status TEXT,
  
  -- Pension & Retirement Planning
  retirement_age_goal INTEGER,
  risk_tolerance TEXT,
  contribution_amount INTEGER,
  contribution_frequency TEXT,
  employer_contribution INTEGER,
  total_annual_contribution INTEGER,
  years_contributed INTEGER,
  
  -- Investment Information
  investment_type TEXT,
  fund_name TEXT,
  annual_return_rate REAL,
  volatility REAL,
  fees_percentage REAL,
  investment_experience_level TEXT,
  portfolio_diversity_score REAL,
  
  -- Pension Projections
  projected_pension_amount INTEGER,
  expected_annual_payout INTEGER,
  inflation_adjusted_payout INTEGER,
  years_of_payout INTEGER,
  survivor_benefits TEXT,
  pension_type TEXT,
  withdrawal_strategy TEXT,
  
  -- Benefits Eligibility
  tax_benefits_eligibility TEXT,
  government_pension_eligibility TEXT,
  private_pension_eligibility TEXT,
  insurance_coverage TEXT,
  
  -- Financial Goals & Planning
  financial_goals TEXT,
  
  -- Transaction Information
  transaction_id TEXT,
  transaction_amount INTEGER,
  transaction_date TEXT,
  transaction_channel TEXT,
  time_of_transaction REAL,
  
  -- Security & Fraud Detection
  suspicious_flag TEXT,
  anomaly_score REAL,
  transaction_pattern_score REAL,
  previous_fraud_flag TEXT,
  
  -- Technical Information
  ip_address TEXT,
  device_id TEXT,
  geo_location TEXT,
  account_age INTEGER,
  
  -- Audit Fields
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
