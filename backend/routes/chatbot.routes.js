const router   = require('express').Router();
const ctrl     = require('../controllers/chatbot.controller');
const auth     = require('../middleware/authenticate');
const { aiLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validateInput');
const { body } = require('express-validator');

router.use(auth);

// GET  /api/chatbot/history
router.get('/history', ctrl.getChatHistory);

// POST /api/chatbot/message
router.post('/message',
  aiLimiter,
  [
    body('message').trim().notEmpty().withMessage('Message cannot be empty'),
    body('conversation_history').optional().isArray(),
  ],
  validate,
  ctrl.sendMessage
);

// DELETE /api/chatbot/history
router.delete('/history', ctrl.clearHistory);

module.exports = router;