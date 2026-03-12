-- Module 8
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  recommendation_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
