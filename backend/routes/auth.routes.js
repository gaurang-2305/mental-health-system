const router     = require('express').Router();
const ctrl       = require('../controllers/auth.controller');
const auth       = require('../middleware/authenticate');
const { authLimiter } = require('../middleware/rateLimiter');
const validate   = require('../middleware/validateInput');
const { body }   = require('express-validator');

// POST /api/auth/register
router.post('/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('role').optional().isIn(['student', 'counselor', 'admin']),
  ],
  validate,
  ctrl.register
);

// POST /api/auth/login
router.post('/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  ctrl.login
);

// POST /api/auth/logout
router.post('/logout', auth, ctrl.logout);

// POST /api/auth/refresh
router.post('/refresh',
  [body('refresh_token').notEmpty()],
  validate,
  ctrl.refreshToken
);

// POST /api/auth/forgot-password
router.post('/forgot-password',
  authLimiter,
  [body('email').isEmail().normalizeEmail()],
  validate,
  ctrl.forgotPassword
);

// PUT /api/auth/update-password
router.put('/update-password',
  auth,
  [body('password').isLength({ min: 8 })],
  validate,
  ctrl.updatePassword
);

// GET /api/auth/me
router.get('/me', auth, ctrl.me);

module.exports = router;