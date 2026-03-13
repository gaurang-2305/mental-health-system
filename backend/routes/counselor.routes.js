const router    = require('express').Router();
const ctrl      = require('../controllers/counselor.controller');
const auth      = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate  = require('../middleware/validateInput');
const { body }  = require('express-validator');

// All counselor routes require authentication + counselor or admin role
router.use(auth, authorize('counselor', 'admin'));

// GET  /api/counselor/dashboard
router.get('/dashboard', ctrl.getDashboard);

// GET  /api/counselor/student-status  — all students with latest mood/stress
router.get('/student-status', ctrl.getStudentStatus);

// GET  /api/counselor/stress-reports
router.get('/stress-reports', ctrl.getStressReports);

// GET  /api/counselor/students/:id/overview
router.get('/students/:id/overview', ctrl.getStudentOverview);

// POST /api/counselor/notes/:student_id  — add counselor note for a student
router.post('/notes/:student_id',
  [body('note').trim().notEmpty().withMessage('Note content is required')],
  validate,
  ctrl.addNote
);

module.exports = router;