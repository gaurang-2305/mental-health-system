// Module 15 – Crisis Alert
import express from 'express';

const router = express.Router();

router.post('/check', (req, res) => {
  res.json({ message: 'Crisis check completed' });
});

export default router;
