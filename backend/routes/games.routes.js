const router   = require('express').Router();
const ctrl     = require('../controllers/games.controller');
const auth     = require('../middleware/authenticate');
const validate = require('../middleware/validateInput');
const { body } = require('express-validator');

router.use(auth);

// GET  /api/games              — list available games
router.get('/', ctrl.getGames);

// GET  /api/games/history      — session history (before /leaderboard to avoid clash)
router.get('/history', ctrl.getSessionHistory);

// GET  /api/games/leaderboard
router.get('/leaderboard', ctrl.getLeaderboard);

// POST /api/games/session      — record a completed game session
router.post('/session',
  [
    body('game_name').trim().notEmpty().withMessage('game_name is required'),
    body('duration_minutes').optional().isInt({ min: 0 }),
    body('mood_before').optional().isInt({ min: 1, max: 10 }),
    body('mood_after').optional().isInt({ min: 1, max: 10 }),
  ],
  validate,
  ctrl.recordSession
);

module.exports = router;