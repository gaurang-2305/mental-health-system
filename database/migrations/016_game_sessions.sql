-- Module 20
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  game_name VARCHAR(255),
  score INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
