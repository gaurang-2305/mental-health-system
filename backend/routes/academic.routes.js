const router   = require('express').Router();
const ctrl     = require('../controllers/academic.controller');
const auth     = require('../middleware/authenticate');
const validate = require('../middleware/validateInput');
const { body } = require('express-validator');

router.use(auth);

router.get('/', ctrl.getRecords);

router.post('/',
  [
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('grade').isFloat({ min: 0, max: 100 }).withMessage('Grade must be 0–100'),
    body('semester').optional().trim(),
  ],
  validate,
  ctrl.addRecord
);

router.put('/:id',
  [
    body('subject').optional().trim().notEmpty(),
    body('grade').optional().isFloat({ min: 0, max: 100 }),
    body('semester').optional().trim(),
  ],
  validate,
  ctrl.updateRecord
);

router.delete('/:id', ctrl.deleteRecord);

module.exports = router;