const router   = require('express').Router();
const ctrl     = require('../controllers/sleep.controller');
const auth     = require('../middleware/authenticate');
const validate = require('../middleware/validateInput');
const { body } = require('express-validator');

router.use(auth);

router.get('/latest', ctrl.getLatestSleep);
router.get('/',       ctrl.getSleepLogs);

router.post('/',
  [
    body('sleep_hours').isFloat({ min: 0, max: 24 }),
    body('sleep_quality').optional().isInt({ min: 1, max: 5 }),
    body('bedtime').optional().matches(/^\d{2}:\d{2}$/),
    body('wake_time').optional().matches(/^\d{2}:\d{2}$/),
    body('logged_date').optional().isISO8601().toDate(),
  ],
  validate,
  ctrl.recordSleep
);

router.put('/:id',    ctrl.updateSleep);
router.delete('/:id', ctrl.deleteSleep);

module.exports = router;