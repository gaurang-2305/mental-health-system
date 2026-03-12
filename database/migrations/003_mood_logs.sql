-- Module 6
CREATE TABLE IF NOT EXISTS mood_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  mood_score INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
