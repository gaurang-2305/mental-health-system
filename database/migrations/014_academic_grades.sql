-- Module 18
CREATE TABLE IF NOT EXISTS academic_grades (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  course VARCHAR(255),
  grade VARCHAR(2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
