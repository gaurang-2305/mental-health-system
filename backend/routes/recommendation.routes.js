// Module 8 – AI Recommendations
import express from 'express';

const router = express.Router();

router.get('/:userId', (req, res) => {
  res.json({ message: 'Get recommendations' });
});

export default router;
