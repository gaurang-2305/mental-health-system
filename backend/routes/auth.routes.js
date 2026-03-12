// Modules 1,2,3
import express from 'express';

const router = express.Router();

router.post('/register', (req, res) => {
  // Registration logic
  res.json({ message: 'Register endpoint' });
});

router.post('/login', (req, res) => {
  // Login logic
  res.json({ message: 'Login endpoint' });
});

router.post('/admin-login', (req, res) => {
  // Admin login logic
  res.json({ message: 'Admin login endpoint' });
});

export default router;
