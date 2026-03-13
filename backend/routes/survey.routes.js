const router   = require('express').Router();
const ctrl     = require('../controllers/survey.controller');
const auth     = require('../middleware/authenticate');
const validate = require('../middleware/validateInput');
const { body } = require('express-validator');

router.use(auth);

// GET  /api/surveys/latest
router.get('/latest', ctrl.getLatestSurvey);

// GET  /api/surveys
router.get('/', ctrl.getSurveys);

// POST /api/surveys
router.post('/',
  [
    body('mood_score').isInt({ min: 1, max: 10 }),
    body('stress_score').isInt({ min: 1, max: 10 }),
    body('sleep_hours').isFloat({ min: 0, max: 24 }),
    body('anxiety_level').isInt({ min: 1, max: 10 }),
    body('responses').optional().isObject(),
  ],
  validate,
  ctrl.submitSurvey
);

module.exports = router;