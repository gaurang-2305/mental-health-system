// Module 9 – Stress Monitoring
import express from 'express';

const router = express.Router();

router.get('/score/:userId', (req, res) => {
  res.json({ message: 'Get stress score' });
});

export default router;
