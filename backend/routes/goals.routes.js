// Module 23
import express from 'express';

const router = express.Router();

router.post('/set', (req, res) => {
  res.json({ message: 'Goal set' });
});

export default router;
