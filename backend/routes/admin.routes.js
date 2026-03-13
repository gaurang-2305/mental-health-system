const router    = require('express').Router();
const ctrl      = require('../controllers/admin.controller');
const auth      = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate  = require('../middleware/validateInput');
const { body }  = require('express-validator');

// All admin routes require admin role
router.use(auth, authorize('admin'));

// GET  /api/admin/dashboard
router.get('/dashboard', ctrl.getDashboard);

// GET  /api/admin/analytics
router.get('/analytics', ctrl.getAnalytics);

// GET  /api/admin/system-stats
router.get('/system-stats', ctrl.getSystemStats);

// GET  /api/admin/users
router.get('/users', ctrl.getUsers);

// POST /api/admin/users
router.post('/users',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('full_name').trim().notEmpty(),
    body('role').isIn(['student', 'counselor', 'admin']),
  ],
  validate,
  ctrl.createUser
);

// PUT  /api/admin/users/:id
router.put('/users/:id',
  [
    body('full_name').optional().trim().notEmpty(),
    body('role_id').optional().isInt({ min: 1, max: 3 }),
    body('age').optional().isInt({ min: 1, max: 120 }),
  ],
  validate,
  ctrl.updateUser
);

// DELETE /api/admin/users/:id
router.delete('/users/:id', ctrl.deleteUser);

module.exports = router;