-- Module 24
CREATE TABLE IF NOT EXISTS mood_predictions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  predicted_mood VARCHAR(50),
  confidence DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
