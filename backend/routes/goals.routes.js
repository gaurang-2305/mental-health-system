const router   = require('express').Router();
const ctrl     = require('../controllers/goals.controller');
const auth     = require('../middleware/authenticate');
const validate = require('../middleware/validateInput');
const { body } = require('express-validator');

router.use(auth);

router.get('/', ctrl.getGoals);

router.post('/',
  [
    body('title').trim().notEmpty().withMessage('Goal title is required'),
    body('description').optional().trim(),
    body('target_date').optional().isISO8601().toDate(),
  ],
  validate,
  ctrl.createGoal
);

// PATCH /:id/complete — before /:id to avoid conflict
router.patch('/:id/complete', ctrl.completeGoal);

router.put('/:id',
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('target_date').optional().isISO8601().toDate(),
    body('is_completed').optional().isBoolean(),
  ],
  validate,
  ctrl.updateGoal
);

router.delete('/:id', ctrl.deleteGoal);

module.exports = router;