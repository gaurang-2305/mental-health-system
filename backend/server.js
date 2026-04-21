require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');

const authRoutes         = require('./routes/auth.routes');
const moodRoutes         = require('./routes/mood.routes');
const surveyRoutes       = require('./routes/survey.routes');
const chatbotRoutes      = require('./routes/chatbot.routes');
const crisisRoutes       = require('./routes/crisis.routes');
const journalRoutes      = require('./routes/journal.routes');
const appointmentRoutes  = require('./routes/appointment.routes');
const counselorRoutes    = require('./routes/counselor.routes');
const adminRoutes        = require('./routes/admin.routes');
const studentRoutes      = require('./routes/student.routes');
const stressRoutes       = require('./routes/stress.routes');
const sleepRoutes        = require('./routes/sleep.routes');
const lifestyleRoutes    = require('./routes/lifestyle.routes');
const goalRoutes         = require('./routes/goals.routes');
const forumRoutes        = require('./routes/forum.routes');
const notificationRoutes = require('./routes/notification.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const reportRoutes       = require('./routes/report.routes');
const surveyRoute        = require('./routes/survey.routes');
const feedbackRoutes     = require('./routes/feedback.routes');
const gamesRoutes        = require('./routes/games.routes');
const attendanceRoutes   = require('./routes/attendance.routes');
const academicRoutes     = require('./routes/academic.routes');
const moodPredictionRoutes = require('./routes/moodPrediction.routes');
const symptomRoutes      = require('./routes/symptom.routes');
const languageRoutes     = require('./routes/language.routes');
const backupRoutes       = require('./routes/backup.routes');
const { defaultLimiter } = require('./middleware/rateLimiter');
const { errorHandler }   = require('./middleware/errorHandler');
const requestLogger      = require('./middleware/logger');
const corsMiddleware     = require('./config/cors');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(corsMiddleware);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use('/api/', defaultLimiter);

app.use('/api/auth',           authRoutes);
app.use('/api/mood',           moodRoutes);
app.use('/api/surveys',        surveyRoutes);
app.use('/api/chatbot',        chatbotRoutes);
app.use('/api/crisis',         crisisRoutes);
app.use('/api/journal',        journalRoutes);
app.use('/api/appointments',   appointmentRoutes);
app.use('/api/counselor',      counselorRoutes);
app.use('/api/admin',          adminRoutes);
app.use('/api/students',       studentRoutes);
app.use('/api/stress',         stressRoutes);
app.use('/api/sleep',          sleepRoutes);
app.use('/api/lifestyle',      lifestyleRoutes);
app.use('/api/goals',          goalRoutes);
app.use('/api/forum',          forumRoutes);
app.use('/api/notifications',  notificationRoutes);
app.use('/api/recommendations',recommendationRoutes);
app.use('/api/reports',        reportRoutes);
app.use('/api/feedback',       feedbackRoutes);
app.use('/api/games',          gamesRoutes);
app.use('/api/attendance',     attendanceRoutes);
app.use('/api/academic',       academicRoutes);
app.use('/api/mood-prediction',moodPredictionRoutes);
app.use('/api/symptoms',       symptomRoutes);
app.use('/api/language',       languageRoutes);
app.use('/api/backup',         backupRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), service: 'MindCare Mental Health API' });
});

app.use(errorHandler);

app.use('*', (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

app.listen(PORT, () => {
  console.log(`
🧠 MindCare Mental Health API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Server running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📡 Health: http://localhost:${PORT}/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

module.exports = app;