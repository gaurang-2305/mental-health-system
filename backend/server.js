require('dotenv').config();
const express    = require('express');
const helmet     = require('helmet');
const compression = require('compression');
const morgan     = require('morgan');
const cors       = require('./config/cors');
const { errorHandler } = require('./middleware/errorHandler');
const logger     = require('./utils/index');

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: msg => logger.http(msg.trim()) } }));

// ─── TEMP DEBUG — remove after fixing ────────────────────────────────────────
app.get('/api/debug', async (req, res) => {
  const supabase = require('./config/supabase');
  const token = req.headers.authorization?.split(' ')[1];
  const dbTest = await supabase.from('user_profiles').select('id,email').limit(1);
  let userTest = null;
  if (token) { userTest = await supabase.auth.getUser(token); }
  res.json({
    dbResult: dbTest,
    userResult: userTest ? { error: userTest.error, userId: userTest.data?.user?.id } : null,
    tokenReceived: !!token,
    tokenFirst20: token?.substring(0, 20)
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',            require('./routes/auth.routes'));
app.use('/api/students',        require('./routes/student.routes'));
app.use('/api/counselor',       require('./routes/counselor.routes'));
app.use('/api/admin',           require('./routes/admin.routes'));
app.use('/api/surveys',         require('./routes/survey.routes'));
app.use('/api/mood',            require('./routes/mood.routes'));
app.use('/api/stress',          require('./routes/stress.routes'));
app.use('/api/sleep',           require('./routes/sleep.routes'));
app.use('/api/lifestyle',       require('./routes/lifestyle.routes'));
app.use('/api/journal',         require('./routes/journal.routes'));
app.use('/api/chatbot',         require('./routes/chatbot.routes'));
app.use('/api/appointments',    require('./routes/appointment.routes'));
app.use('/api/notifications',   require('./routes/notification.routes'));
app.use('/api/crisis',          require('./routes/crisis.routes'));
app.use('/api/forum',           require('./routes/forum.routes'));
app.use('/api/recommendations', require('./routes/recommendation.routes'));
app.use('/api/goals',           require('./routes/goals.routes'));
app.use('/api/games',           require('./routes/games.routes'));
app.use('/api/reports',         require('./routes/report.routes'));
app.use('/api/feedback',        require('./routes/feedback.routes'));
app.use('/api/academic',        require('./routes/academic.routes'));
app.use('/api/attendance',      require('./routes/attendance.routes'));
app.use('/api/mood-prediction', require('./routes/moodPrediction.routes'));
app.use('/api/symptoms',        require('./routes/symptom.routes'));
app.use('/api/language',        require('./routes/language.routes'));
app.use('/api/backup',          require('./routes/backup.routes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`MindCare API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  const { startCronJobs } = require('./services/backupService');
  startCronJobs();
});

module.exports = app;