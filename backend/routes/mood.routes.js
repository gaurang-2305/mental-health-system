// Module 6 – Mood Tracker
import express from 'express';

const router = express.Router();

router.post('/record', (req, res) => {
  res.json({ message: 'Mood recorded' });
});

router.get('/:userId', (req, res) => {
  res.json({ message: 'Get mood history' });
});

export default router;
