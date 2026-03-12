// Module 17
import express from 'express';

const router = express.Router();

router.post('/record', (req, res) => {
  res.json({ message: 'Sleep data recorded' });
});

export default router;
