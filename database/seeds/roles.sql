-- Roles
INSERT INTO roles_permissions (role, permission) VALUES
  ('student', 'view_profile'),
  ('counselor', 'view_student_data'),
  ('admin', 'manage_users');
