const router    = require('express').Router();
const ctrl      = require('../controllers/counselor.controller');
const auth      = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { body }  = require('express-validator');
const validate  = require('../middleware/validateInput');

router.use(auth);

// GET /api/counselor/dashboard
router.get('/dashboard', authorize('counselor', 'admin'), ctrl.getDashboard);

// GET /api/counselor/students/:id/overview
router.get('/students/:id/overview', authorize('counselor', 'admin'), ctrl.getStudentOverview);

// GET /api/counselor/stress-reports
router.get('/stress-reports', authorize('counselor', 'admin'), ctrl.getStressReports);

// GET /api/counselor/student-status
router.get('/student-status', authorize('counselor', 'admin'), ctrl.getStudentStatus);

// POST /api/counselor/notes/:student_id
router.post('/notes/:student_id',
  authorize('counselor', 'admin'),
  [body('note').trim().notEmpty().withMessage('Note cannot be empty')],
  validate,
  ctrl.addNote
);

module.exports = router;