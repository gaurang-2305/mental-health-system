// Module 12
import express from 'express';

const router = express.Router();

router.post('/schedule', (req, res) => {
  res.json({ message: 'Appointment scheduled' });
});

router.get('/:userId', (req, res) => {
  res.json({ message: 'Get appointments' });
});

export default router;
