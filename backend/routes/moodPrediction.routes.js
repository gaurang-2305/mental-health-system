// Module 24 – AI Prediction
import express from 'express';

const router = express.Router();

router.get('/predict/:userId', (req, res) => {
  res.json({ message: 'Mood prediction' });
});

export default router;
