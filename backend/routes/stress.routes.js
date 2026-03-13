const router   = require('express').Router();
const ctrl     = require('../controllers/stress.controller');
const auth     = require('../middleware/authenticate');
const validate = require('../middleware/validateInput');
const { body } = require('express-validator');

router.use(auth);

// GET  /api/stress/latest
router.get('/latest', ctrl.getLatestStress);

// GET  /api/stress
router.get('/', ctrl.getStressScores);

// POST /api/stress
router.post('/',
  [
    body('score').isFloat({ min: 0, max: 100 }).withMessage('score must be 0–100'),
    body('risk_level').isIn(['low', 'moderate', 'high', 'critical']),
  ],
  validate,
  ctrl.saveStressScore
);

module.exports = router;