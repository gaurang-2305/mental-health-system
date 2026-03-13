const router    = require('express').Router();
const ctrl      = require('../controllers/appointment.controller');
const auth      = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate  = require('../middleware/validateInput');
const { body }  = require('express-validator');

router.use(auth);

// GET  /api/appointments/counselors — list all counselors (for booking UI)
router.get('/counselors', ctrl.getCounselors);

// GET  /api/appointments
router.get('/', ctrl.getAppointments);

// GET  /api/appointments/:id
router.get('/:id', ctrl.getAppointment);

// POST /api/appointments
router.post('/',
  [
    body('counselor_id').isUUID().withMessage('Valid counselor_id required'),
    body('scheduled_at').isISO8601().withMessage('Valid scheduled_at datetime required'),
    body('notes').optional().trim(),
  ],
  validate,
  ctrl.bookAppointment
);

// PATCH /api/appointments/:id  — update status/notes (counselor or admin)
router.patch('/:id',
  authorize('counselor', 'admin'),
  [
    body('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed']),
    body('notes').optional().trim(),
    body('scheduled_at').optional().isISO8601(),
  ],
  validate,
  ctrl.updateAppointment
);

// DELETE /api/appointments/:id  — cancel
router.delete('/:id', ctrl.cancelAppointment);

module.exports = router;