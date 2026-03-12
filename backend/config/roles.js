// Module 28 – RBAC config
export const roles = {
  STUDENT: 'student',
  COUNSELOR: 'counselor',
  ADMIN: 'admin',
};

export const rolePermissions = {
  student: ['view_profile', 'submit_survey', 'track_mood'],
  counselor: ['view_student_data', 'send_recommendations', 'manage_appointments'],
  admin: ['manage_users', 'view_analytics', 'manage_system'],
};
