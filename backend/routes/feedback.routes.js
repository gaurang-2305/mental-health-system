// Module 25
import express from 'express';

const router = express.Router();

router.post('/submit', (req, res) => {
  res.json({ message: 'Feedback submitted' });
});

export default router;
