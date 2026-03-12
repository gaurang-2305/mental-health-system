-- Module 23
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  goal_text TEXT,
  target_date DATE,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
