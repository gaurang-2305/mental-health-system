// Module 7 – Symptom Analysis
import express from 'express';

const router = express.Router();

router.post('/analyze', (req, res) => {
  res.json({ message: 'Symptoms analyzed' });
});

export default router;
