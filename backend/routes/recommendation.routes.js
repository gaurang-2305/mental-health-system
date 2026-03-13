const router   = require('express').Router();
const ctrl     = require('../controllers/recommendation.controller');
const auth     = require('../middleware/authenticate');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(auth);

// GET  /api/recommendations
router.get('/', ctrl.getRecommendations);

// POST /api/recommendations/generate  — AI-powered
router.post('/generate', aiLimiter, ctrl.generateRecommendations);

// PATCH /api/recommendations/read-all  — before /:id
router.patch('/read-all', ctrl.markAllAsRead);

// PATCH /api/recommendations/:id/read
router.patch('/:id/read', ctrl.markAsRead);

module.exports = router;