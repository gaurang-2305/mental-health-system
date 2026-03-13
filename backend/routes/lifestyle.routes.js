const router   = require('express').Router();
const ctrl     = require('../controllers/lifestyle.controller');
const auth     = require('../middleware/authenticate');
const validate = require('../middleware/validateInput');
const { body } = require('express-validator');

router.use(auth);

router.get('/', ctrl.getLifestyleLogs);

router.post('/',
  [
    body('exercise_minutes').optional().isInt({ min: 0 }),
    body('exercise_type').optional().trim(),
    body('diet_quality').optional().isInt({ min: 1, max: 5 }),
    body('water_intake_liters').optional().isFloat({ min: 0 }),
    body('logged_date').optional().isISO8601().toDate(),
  ],
  validate,
  ctrl.logLifestyle
);

router.put('/:id',    ctrl.updateLifestyle);
router.delete('/:id', ctrl.deleteLifestyle);

module.exports = router;