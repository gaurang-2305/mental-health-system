// Module 16 – Peer Forum
import express from 'express';

const router = express.Router();

router.post('/post', (req, res) => {
  res.json({ message: 'Post created' });
});

router.get('/', (req, res) => {
  res.json({ message: 'Get forum posts' });
});

export default router;
