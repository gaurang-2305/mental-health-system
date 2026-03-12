-- Module 15
CREATE TABLE IF NOT EXISTS crisis_alerts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  risk_score DECIMAL(3, 2),
  alert_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
