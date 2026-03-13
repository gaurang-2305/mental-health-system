const router   = require('express').Router();
const ctrl     = require('../controllers/student.controller');
const auth     = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validateInput');
const { body } = require('express-validator');

// All routes require authentication
router.use(auth);

// GET  /api/students/profile  — own profile
router.get('/profile', ctrl.getProfile);

// PUT  /api/students/profile
router.put('/profile',
  [
    body('full_name').optional().trim().notEmpty(),
    body('age').optional().isInt({ min: 1, max: 120 }),
    body('phone').optional().trim(),
    body('language_pref').optional().isLength({ min: 2, max: 5 }),
  ],
  validate,
  ctrl.updateProfile
);

// GET  /api/students/dashboard  — student's own dashboard summary
router.get('/dashboard', ctrl.getDashboard);

// GET  /api/students  — counselor/admin: list all students
router.get('/', authorize('counselor', 'admin'), ctrl.getAllStudents);

// GET  /api/students/:id  — counselor/admin: single student
router.get('/:id', authorize('counselor', 'admin'), ctrl.getStudentById);

module.exports = router;