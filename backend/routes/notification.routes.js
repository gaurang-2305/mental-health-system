const router    = require('express').Router();
const ctrl      = require('../controllers/notification.controller');
const auth      = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate  = require('../middleware/validateInput');
const { body }  = require('express-validator');

router.use(auth);

// GET  /api/notifications
router.get('/', ctrl.getNotifications);

// PATCH /api/notifications/read-all  — must be before /:id
router.patch('/read-all', ctrl.markAllAsRead);

// DELETE /api/notifications/clear-all
router.delete('/clear-all', ctrl.clearAll);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', ctrl.markAsRead);

// DELETE /api/notifications/:id
router.delete('/:id', ctrl.deleteNotification);

// POST /api/notifications  — counselor/admin broadcast
router.post('/',
  authorize('counselor', 'admin'),
  [
    body('user_id').isUUID(),
    body('title').trim().notEmpty(),
    body('message').trim().notEmpty(),
    body('type').optional().trim(),
  ],
  validate,
  ctrl.sendNotification
);

module.exports = router;