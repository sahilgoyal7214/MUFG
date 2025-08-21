-- Migration: Create pension_data table
-- Date: 2025-08-17
-- Description: Main table for storing comprehensive pension member data including financial, personal, and transaction information

CREATE TABLE IF NOT EXISTS pension_data (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  
  -- Personal Information
  age INTEGER,
  gender VARCHAR(50),
  country VARCHAR(100),
  employment_status VARCHAR(100),
  marital_status VARCHAR(100),
  number_of_dependents INTEGER,
  education_level VARCHAR(100),
  health_status VARCHAR(50),
  life_expectancy_estimate INTEGER,
  
  -- Financial Information
  annual_income INTEGER,
  current_savings INTEGER,
  debt_level INTEGER,
  monthly_expenses INTEGER,
  savings_rate DECIMAL(5,4),
  home_ownership_status VARCHAR(100),
  
  -- Pension & Retirement Planning
  retirement_age_goal INTEGER,
  risk_tolerance VARCHAR(50),
  contribution_amount INTEGER,
  contribution_frequency VARCHAR(50),
  employer_contribution INTEGER,
  total_annual_contribution INTEGER,
  years_contributed INTEGER,
  
  -- Investment Information
  investment_type VARCHAR(100),
  fund_name VARCHAR(255),
  annual_return_rate DECIMAL(8,4),
  volatility DECIMAL(8,4),
  fees_percentage DECIMAL(8,4),
  investment_experience_level VARCHAR(100),
  portfolio_diversity_score DECIMAL(5,4),
  
  -- Pension Projections
  projected_pension_amount INTEGER,
  expected_annual_payout INTEGER,
  inflation_adjusted_payout INTEGER,
  years_of_payout INTEGER,
  survivor_benefits VARCHAR(10),
  pension_type VARCHAR(100),
  withdrawal_strategy VARCHAR(100),
  
  -- Benefits Eligibility
  tax_benefits_eligibility VARCHAR(10),
  government_pension_eligibility VARCHAR(10),
  private_pension_eligibility VARCHAR(10),
  insurance_coverage VARCHAR(10),
  
  -- Financial Goals & Planning
  financial_goals VARCHAR(255),
  
  -- Transaction Information
  transaction_id VARCHAR(255),
  transaction_amount INTEGER,
  transaction_date VARCHAR(255), -- Note: Excel date format needs conversion
  transaction_channel VARCHAR(100),
  time_of_transaction DECIMAL(15,12),
  
  -- Security & Fraud Detection
  suspicious_flag VARCHAR(10),
  anomaly_score DECIMAL(5,4),
  transaction_pattern_score DECIMAL(5,4),
  previous_fraud_flag VARCHAR(10),
  
  -- Technical Information
  ip_address VARCHAR(45), -- Support IPv6
  device_id VARCHAR(255),
  geo_location VARCHAR(255),
  account_age INTEGER,
  
  -- Audit Fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_country (country),
  INDEX idx_pension_type (pension_type),
  INDEX idx_risk_tolerance (risk_tolerance),
  INDEX idx_suspicious_flag (suspicious_flag),
  INDEX idx_created_at (created_at)
);

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pension_data_updated_at 
    BEFORE UPDATE ON pension_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE pension_data IS 'Comprehensive pension member data including financial information, investment details, and fraud detection metrics';
COMMENT ON COLUMN pension_data.user_id IS 'Unique identifier for pension plan member';
COMMENT ON COLUMN pension_data.anomaly_score IS 'ML-generated score indicating potential anomalous behavior (0-1 scale)';
COMMENT ON COLUMN pension_data.portfolio_diversity_score IS 'Investment portfolio diversification score (0-1 scale)';
COMMENT ON COLUMN pension_data.transaction_pattern_score IS 'Score indicating unusual transaction patterns (0-1 scale)';
