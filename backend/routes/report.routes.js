// Modules 21, 29 – Reports & Export
import express from 'express';

const router = express.Router();

router.get('/weekly/:userId', (req, res) => {
  res.json({ message: 'Get weekly report' });
});

router.get('/export/:userId', (req, res) => {
  res.json({ message: 'Export report' });
});

export default router;
