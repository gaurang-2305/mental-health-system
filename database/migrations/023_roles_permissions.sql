-- Module 28 – RBAC
CREATE TABLE IF NOT EXISTS roles_permissions (
  id UUID PRIMARY KEY,
  role VARCHAR(50),
  permission VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
