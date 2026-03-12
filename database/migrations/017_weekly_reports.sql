-- Module 21
CREATE TABLE IF NOT EXISTS weekly_reports (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  week_start DATE,
  summary JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
