-- Module 22
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  entry_text TEXT,
  sentiment VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
