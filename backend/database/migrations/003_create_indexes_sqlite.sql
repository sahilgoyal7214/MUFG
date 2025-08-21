-- Create indexes for performance after table creation
CREATE INDEX IF NOT EXISTS idx_user_id ON pension_data(user_id);
CREATE INDEX IF NOT EXISTS idx_country ON pension_data(country);
CREATE INDEX IF NOT EXISTS idx_pension_type ON pension_data(pension_type);
CREATE INDEX IF NOT EXISTS idx_risk_tolerance ON pension_data(risk_tolerance);
CREATE INDEX IF NOT EXISTS idx_suspicious_flag ON pension_data(suspicious_flag);
CREATE INDEX IF NOT EXISTS idx_created_at ON pension_data(created_at);
