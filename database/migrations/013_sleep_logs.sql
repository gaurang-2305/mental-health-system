-- Module 17
CREATE TABLE IF NOT EXISTS sleep_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  sleep_hours DECIMAL(3, 1),
  quality VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
