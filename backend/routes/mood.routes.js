const router   = require('express').Router();
const ctrl     = require('../controllers/mood.controller');
const auth     = require('../middleware/authenticate');
const validate = require('../middleware/validateInput');
const { body } = require('express-validator');

router.use(auth);

// GET  /api/mood/latest
router.get('/latest', ctrl.getLatestMood);

// GET  /api/mood
router.get('/', ctrl.getMoodHistory);

// POST /api/mood
router.post('/',
  [
    body('mood_score').isInt({ min: 1, max: 10 }).withMessage('mood_score must be 1–10'),
    body('mood_emoji').optional().trim(),
    body('notes').optional().trim(),
  ],
  validate,
  ctrl.recordMood
);

// DELETE /api/mood/:id
router.delete('/:id', ctrl.deleteMood);

module.exports = router;