-- Module 10
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  present BOOLEAN,
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
