// Module 13 – Counselor Dashboard
import express from 'express';

const router = express.Router();

router.get('/dashboard/:counselorId', (req, res) => {
  res.json({ message: 'Get counselor dashboard' });
});

export default router;
