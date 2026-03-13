const router    = require('express').Router();
const ctrl      = require('../controllers/feedback.controller');
const auth      = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate  = require('../middleware/validateInput');
const { body }  = require('express-validator');

router.use(auth);

// GET  /api/feedback/my
router.get('/my', ctrl.getMyFeedback);

// GET  /api/feedback  — counselor/admin only
router.get('/', authorize('counselor', 'admin'), ctrl.getFeedback);

// POST /api/feedback
router.post('/',
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
    body('message').optional().trim(),
  ],
  validate,
  ctrl.submitFeedback
);

module.exports = router;