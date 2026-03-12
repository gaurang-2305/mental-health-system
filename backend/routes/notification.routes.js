// Module 14
import express from 'express';

const router = express.Router();

router.get('/:userId', (req, res) => {
  res.json({ message: 'Get notifications' });
});

export default router;
