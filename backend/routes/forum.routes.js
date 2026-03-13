const router   = require('express').Router();
const ctrl     = require('../controllers/forum.controller');
const auth     = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validateInput');
const { body } = require('express-validator');

router.use(auth);

// Posts
router.get('/posts',      ctrl.getPosts);
router.get('/posts/:id',  ctrl.getPost);

router.post('/posts',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('is_anonymous').optional().isBoolean(),
  ],
  validate,
  ctrl.createPost
);

router.put('/posts/:id',
  [
    body('title').optional().trim().notEmpty(),
    body('content').optional().trim().notEmpty(),
  ],
  validate,
  ctrl.updatePost
);

router.delete('/posts/:id', ctrl.deletePost);

// Replies
router.post('/posts/:id/replies',
  [body('content').trim().notEmpty().withMessage('Reply content is required')],
  validate,
  ctrl.createReply
);

router.delete('/replies/:id', ctrl.deleteReply);

module.exports = router;