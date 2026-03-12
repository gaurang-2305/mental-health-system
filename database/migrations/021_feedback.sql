-- Module 25
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  feedback_text TEXT,
  rating INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
