// Module 19
import express from 'express';

const router = express.Router();

router.post('/log', (req, res) => {
  res.json({ message: 'Lifestyle logged' });
});

export default router;
