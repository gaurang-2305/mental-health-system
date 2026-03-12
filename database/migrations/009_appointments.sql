-- Module 12
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  counselor_id UUID REFERENCES users(id),
  scheduled_at TIMESTAMP,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
