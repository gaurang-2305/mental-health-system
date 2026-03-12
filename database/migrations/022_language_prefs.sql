-- Module 26
CREATE TABLE IF NOT EXISTS language_prefs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  language_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
