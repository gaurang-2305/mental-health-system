const router   = require('express').Router();
const ctrl     = require('../controllers/report.controller');
const auth     = require('../middleware/authenticate');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(auth);

// GET  /api/reports/latest
router.get('/latest', ctrl.getLatestReport);

// GET  /api/reports
router.get('/', ctrl.getReports);

// POST /api/reports/generate  — triggers AI-generated weekly summary
router.post('/generate', aiLimiter, ctrl.generateWeeklyReport);

module.exports = router;