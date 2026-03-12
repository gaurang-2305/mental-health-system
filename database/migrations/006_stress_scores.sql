-- Module 9
CREATE TABLE IF NOT EXISTS stress_scores (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  stress_score DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
