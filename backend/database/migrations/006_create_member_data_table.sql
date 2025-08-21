-- Create member_data table for storing detailed member information
-- Date: 2025-08-20

CREATE TABLE IF NOT EXISTS member_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id TEXT UNIQUE NOT NULL,
  personal_info TEXT DEFAULT '{}', -- JSON field for personal information
  employment_info TEXT DEFAULT '{}', -- JSON field for employment information
  pension_details TEXT DEFAULT '{}', -- JSON field for pension details
  contributions TEXT DEFAULT '[]', -- JSON array for contribution history
  projections TEXT DEFAULT '{}', -- JSON field for projections
  risk_profile TEXT DEFAULT '{}', -- JSON field for risk profile
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_member_data_member_id ON member_data(member_id);
CREATE INDEX IF NOT EXISTS idx_member_data_created_at ON member_data(created_at);

-- Insert some sample data for testing
INSERT OR IGNORE INTO member_data (member_id, personal_info, employment_info, pension_details, contributions, projections, risk_profile) VALUES 
('TEST001', 
 '{"name": "Test User", "age": 35, "email": "test@mufg.com"}',
 '{"company": "MUFG", "salary": 75000, "employment_type": "full-time"}',
 '{"current_balance": 125000, "contribution_rate": 0.08}',
 '[{"date": "2025-01-01", "amount": 500}, {"date": "2025-02-01", "amount": 500}]',
 '{"retirement_age": 65, "projected_balance": 850000}',
 '{"risk_tolerance": "moderate", "investment_horizon": 30}'
),
('U1001', 
 '{"name": "John Smith", "age": 42, "email": "john.smith@example.com"}',
 '{"company": "Tech Corp", "salary": 95000, "employment_type": "full-time"}',
 '{"current_balance": 245000, "contribution_rate": 0.10}',
 '[{"date": "2025-01-01", "amount": 750}, {"date": "2025-02-01", "amount": 750}]',
 '{"retirement_age": 62, "projected_balance": 1200000}',
 '{"risk_tolerance": "aggressive", "investment_horizon": 20}'
),
('U1002', 
 '{"name": "Sarah Johnson", "age": 28, "email": "sarah.johnson@example.com"}',
 '{"company": "Finance Ltd", "salary": 65000, "employment_type": "full-time"}',
 '{"current_balance": 45000, "contribution_rate": 0.06}',
 '[{"date": "2025-01-01", "amount": 325}, {"date": "2025-02-01", "amount": 325}]',
 '{"retirement_age": 67, "projected_balance": 950000}',
 '{"risk_tolerance": "conservative", "investment_horizon": 39}'
);
