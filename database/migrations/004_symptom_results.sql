-- Module 7
CREATE TABLE IF NOT EXISTS symptom_results (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  symptoms JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
