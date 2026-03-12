-- Module 5
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  answers JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
