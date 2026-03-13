const router    = require('express').Router();
const ctrl      = require('../controllers/crisis.controller');
const auth      = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate  = require('../middleware/validateInput');
const { body }  = require('express-validator');

router.use(auth);

// GET  /api/crisis/my  — student: own alerts
router.get('/my', ctrl.getMyAlerts);

// GET  /api/crisis  — counselor/admin: all alerts
router.get('/', authorize('counselor', 'admin'), ctrl.getCrisisAlerts);

// POST /api/crisis  — student self-reports
router.post('/',
  [
    body('risk_level').optional().isIn(['high', 'critical']),
    body('trigger_reason').optional().trim(),
  ],
  validate,
  ctrl.createAlert
);

// PATCH /api/crisis/:id/resolve  — counselor/admin
router.patch('/:id/resolve', authorize('counselor', 'admin'), ctrl.resolveAlert);

// PATCH /api/crisis/:id/assign  — admin only
router.patch('/:id/assign',
  authorize('admin'),
  [body('counselor_id').isUUID()],
  validate,
  ctrl.assignCounselor
);

module.exports = router;