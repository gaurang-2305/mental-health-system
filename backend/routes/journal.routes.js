const router   = require('express').Router();
const ctrl     = require('../controllers/journal.controller');
const auth     = require('../middleware/authenticate');
const validate = require('../middleware/validateInput');
const { body } = require('express-validator');

router.use(auth);

router.get('/',     ctrl.getEntries);
router.get('/:id',  ctrl.getEntry);

router.post('/',
  [body('content').trim().notEmpty().withMessage('Journal content cannot be empty')],
  validate,
  ctrl.createEntry
);

router.put('/:id',
  [body('content').trim().notEmpty()],
  validate,
  ctrl.updateEntry
);

router.delete('/:id', ctrl.deleteEntry);

module.exports = router;