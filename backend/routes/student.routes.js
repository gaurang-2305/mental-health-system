// Module 4 – Profile
import express from 'express';

const router = express.Router();

router.get('/profile/:userId', (req, res) => {
  res.json({ message: 'Get profile' });
});

router.put('/profile/:userId', (req, res) => {
  res.json({ message: 'Update profile' });
});

export default router;
