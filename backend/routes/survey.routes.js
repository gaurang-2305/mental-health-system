// Module 5 – Survey
import express from 'express';

const router = express.Router();

router.post('/submit', (req, res) => {
  res.json({ message: 'Survey submitted' });
});

router.get('/:userId', (req, res) => {
  res.json({ message: 'Get survey results' });
});

export default router;
