const router   = require('express').Router();
const ctrl     = require('../controllers/moodPrediction.controller');
const auth     = require('../middleware/authenticate');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(auth);

// GET  /api/mood-prediction
router.get('/', ctrl.getPredictions);

// POST /api/mood-prediction/generate
router.post('/generate', aiLimiter, ctrl.generatePrediction);

module.exports = router;