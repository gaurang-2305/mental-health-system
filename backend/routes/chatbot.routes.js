// Module 11 – AI Chatbot (Grok)
import express from 'express';

const router = express.Router();

router.post('/message', (req, res) => {
  res.json({ message: 'Chat message received' });
});

export default router;
