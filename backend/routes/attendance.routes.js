const router   = require('express').Router();
const ctrl     = require('../controllers/attendance.controller');
const auth     = require('../middleware/authenticate');
const validate = require('../middleware/validateInput');
const { body } = require('express-validator');

router.use(auth);

router.get('/today', ctrl.getTodayAttendance);
router.get('/',      ctrl.getAttendance);

router.post('/',
  [
    body('date').optional().isISO8601().toDate(),
    body('is_present').optional().isBoolean(),
    body('notes').optional().trim(),
  ],
  validate,
  ctrl.logAttendance
);

module.exports = router;