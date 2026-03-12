// Module 28, 30 – Admin & Analytics
import express from 'express';

const router = express.Router();

router.get('/dashboard', (req, res) => {
  res.json({ message: 'Admin dashboard' });
});

router.get('/analytics', (req, res) => {
  res.json({ message: 'Analytics data' });
});

export default router;
