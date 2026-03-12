// Module 18 – Academic Integration
import express from 'express';

const router = express.Router();

router.get('/:userId', (req, res) => {
  res.json({ message: 'Get academic data' });
});

export default router;
