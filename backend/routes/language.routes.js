const router   = require('express').Router();
const ctrl     = require('../controllers/language.controller');
const auth     = require('../middleware/authenticate');
const validate = require('../middleware/validateInput');
const { body } = require('express-validator');

router.use(auth);

// GET  /api/language
router.get('/', ctrl.getLanguage);

// PUT  /api/language
router.put('/',
  [body('language').trim().notEmpty().withMessage('language is required')],
  validate,
  ctrl.updateLanguage
);

module.exports = router;