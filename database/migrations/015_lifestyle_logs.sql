-- Module 19
CREATE TABLE IF NOT EXISTS lifestyle_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  activity VARCHAR(255),
  duration_minutes INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
