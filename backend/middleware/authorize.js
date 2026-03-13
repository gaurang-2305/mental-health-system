const { ROLES } = require('../config/roles');

/**
 * Role-based authorization middleware factory.
 * Usage: authorize('admin') | authorize('counselor', 'admin') | authorize(2)
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.profile) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userRole = req.roleName;
    const userId   = req.roleId;

    const allowed = allowedRoles.some(role => {
      if (typeof role === 'number') return userId >= role;
      if (role === 'admin')     return userId === ROLES.ADMIN;
      if (role === 'counselor') return userId >= ROLES.COUNSELOR;
      if (role === 'student')   return userId >= ROLES.STUDENT;
      return false;
    });

    if (!allowed) {
      return res.status(403).json({
        error: `Access denied. Required: ${allowedRoles.join(' or ')}. Your role: ${userRole}`
      });
    }
    next();
  };
}

module.exports = authorize;