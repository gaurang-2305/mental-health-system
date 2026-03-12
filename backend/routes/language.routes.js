// Module 26
import express from 'express';

const router = express.Router();

router.post('/set', (req, res) => {
  res.json({ message: 'Language set' });
});

export default router;
