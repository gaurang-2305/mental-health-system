const router   = require('express').Router();
const ctrl     = require('../controllers/symptom.controller');
const auth     = require('../middleware/authenticate');
const { aiLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validateInput');
const { body } = require('express-validator');

router.use(auth);

// GET  /api/symptoms
router.get('/', ctrl.getAnalyses);

// POST /api/symptoms/analyze
router.post('/analyze',
  aiLimiter,
  [
    body('symptoms').notEmpty().withMessage('Symptoms are required'),
    body('duration_days').optional().isInt({ min: 0 }),
    body('severity').optional().isInt({ min: 1, max: 10 }),
  ],
  validate,
  ctrl.analyzeSymptoms
);

module.exports = router;