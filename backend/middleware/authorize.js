// Module 28 – role check
export async function authorize(requiredRole) {
  return (req, res, next) => {
    if (req.user?.role === requiredRole) {
      next();
    } else {
      res.status(403).json({ error: 'Insufficient permissions' });
    }
  };
}
