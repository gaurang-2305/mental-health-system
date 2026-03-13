const router    = require('express').Router();
const ctrl      = require('../controllers/backup.controller');
const auth      = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// All backup routes: admin only
router.use(auth, authorize('admin'));

// GET  /api/backup/tables   — row counts per table
router.get('/tables', ctrl.getTableStats);

// GET  /api/backup/export?format=json|xlsx&tables=user_profiles,surveys,...
router.get('/export', ctrl.exportData);

module.exports = router;