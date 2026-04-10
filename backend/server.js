import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.js';
import moodRoutes from './routes/mood.js';
import surveyRoutes from './routes/surveys.js';
import chatRoutes from './routes/chat.js';
import alertRoutes from './routes/alerts.js';
import journalRoutes from './routes/journal.js';
import analyticsRoutes from './routes/analytics.js';
import miscRoutes from './routes/misc.js';
import appointmentRoutes from './routes/appointments.js';
import counselorRoutes from './routes/counselors.js'; // NEW

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// Middleware
// ============================================================
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later' }
});
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'AI rate limit exceeded, please wait a moment' }
});

app.use('/api/', limiter);
app.use('/api/chat', aiLimiter);

// ============================================================
// Routes
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/counselors', counselorRoutes); // NEW — must be before /api misc catch-all
app.use('/api', miscRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), service: 'MindCare Mental Health API' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

app.listen(PORT, () => {
  console.log(`
🧠 MindCare Mental Health API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Server running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV}
📡 Health: http://localhost:${PORT}/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export default app;