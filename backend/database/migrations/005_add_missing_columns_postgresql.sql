-- Migration: Add missing columns to PostgreSQL pension_data table
-- This brings PostgreSQL schema in sync with SQLite and Excel data

ALTER TABLE pension_data 
ADD COLUMN IF NOT EXISTS survivor_benefits VARCHAR(50),
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS transaction_amount INTEGER,
ADD COLUMN IF NOT EXISTS transaction_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS financial_goals TEXT,
ADD COLUMN IF NOT EXISTS insurance_coverage VARCHAR(100),
ADD COLUMN IF NOT EXISTS tax_benefits_eligibility VARCHAR(50),
ADD COLUMN IF NOT EXISTS government_pension_eligibility VARCHAR(50),
ADD COLUMN IF NOT EXISTS private_pension_eligibility VARCHAR(50),
ADD COLUMN IF NOT EXISTS withdrawal_strategy VARCHAR(100),
ADD COLUMN IF NOT EXISTS transaction_channel VARCHAR(50),
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
ADD COLUMN IF NOT EXISTS device_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS geo_location VARCHAR(100),
ADD COLUMN IF NOT EXISTS time_of_transaction VARCHAR(50),
ADD COLUMN IF NOT EXISTS previous_fraud_flag BOOLEAN,
ADD COLUMN IF NOT EXISTS account_age INTEGER;

-- Add indexes for performance on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_pension_transaction_id ON pension_data(transaction_id);
CREATE INDEX IF NOT EXISTS idx_pension_survivor_benefits ON pension_data(survivor_benefits);
CREATE INDEX IF NOT EXISTS idx_pension_transaction_date ON pension_data(transaction_date);
CREATE INDEX IF NOT EXISTS idx_pension_device_id ON pension_data(device_id);
CREATE INDEX IF NOT EXISTS idx_pension_previous_fraud_flag ON pension_data(previous_fraud_flag);

-- Update the column comments for documentation
COMMENT ON COLUMN pension_data.survivor_benefits IS 'Survivor benefits eligibility and details';
COMMENT ON COLUMN pension_data.transaction_id IS 'Unique transaction identifier';
COMMENT ON COLUMN pension_data.transaction_amount IS 'Transaction amount in currency units';
COMMENT ON COLUMN pension_data.transaction_date IS 'Date and time of transaction';
COMMENT ON COLUMN pension_data.financial_goals IS 'User financial goals and objectives';
COMMENT ON COLUMN pension_data.insurance_coverage IS 'Insurance coverage details';
COMMENT ON COLUMN pension_data.tax_benefits_eligibility IS 'Tax benefits eligibility status';
COMMENT ON COLUMN pension_data.government_pension_eligibility IS 'Government pension eligibility';
COMMENT ON COLUMN pension_data.private_pension_eligibility IS 'Private pension eligibility';
COMMENT ON COLUMN pension_data.withdrawal_strategy IS 'Pension withdrawal strategy';
COMMENT ON COLUMN pension_data.transaction_channel IS 'Channel used for transaction';
COMMENT ON COLUMN pension_data.ip_address IS 'IP address of transaction origin';
COMMENT ON COLUMN pension_data.device_id IS 'Device identifier for transaction';
COMMENT ON COLUMN pension_data.geo_location IS 'Geographic location of transaction';
COMMENT ON COLUMN pension_data.time_of_transaction IS 'Time of transaction processing';
COMMENT ON COLUMN pension_data.previous_fraud_flag IS 'Flag indicating previous fraud history';
COMMENT ON COLUMN pension_data.account_age IS 'Age of the account in days';
