const supabase = require('../config/supabase');
const logger   = require('../utils/index');

/**
 * Create a single notification row.
 * Used internally by other services/controllers — not exposed directly as a route.
 *
 * @param {Object} opts
 * @param {string} opts.user_id
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {string} [opts.type]   — 'appointment' | 'crisis_alert' | 'survey_reminder' | 'counselor_note' | ...
 */
async function createNotification({ user_id, title, message, type = 'general' }) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({ user_id, title, message, type })
      .select()
      .single();

    if (error) {
      logger.error(`createNotification failed for user ${user_id}: ${error.message}`);
      return null;
    }
    return data;
  } catch (err) {
    logger.error(`createNotification exception: ${err.message}`);
    return null;
  }
}

/**
 * Broadcast the same notification to multiple users.
 *
 * @param {string[]} userIds
 * @param {string}   title
 * @param {string}   message
 * @param {string}   [type]
 */
async function broadcastNotification(userIds, title, message, type = 'broadcast') {
  if (!userIds?.length) return;

  const rows = userIds.map(user_id => ({ user_id, title, message, type }));

  const { error } = await supabase.from('notifications').insert(rows);
  if (error) logger.error(`broadcastNotification failed: ${error.message}`);
}

/**
 * Notify all students with a given role_id.
 */
async function notifyAllStudents(title, message, type = 'broadcast') {
  const { data: students } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('role_id', 1);

  if (!students?.length) return;
  await broadcastNotification(students.map(s => s.id), title, message, type);
}

/**
 * Notify all counselors.
 */
async function notifyAllCounselors(title, message, type = 'broadcast') {
  const { data: counselors } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('role_id', 2);

  if (!counselors?.length) return;
  await broadcastNotification(counselors.map(c => c.id), title, message, type);
}

/**
 * Send a survey reminder to all students who haven't submitted in `daysSince` days.
 */
async function sendSurveyReminders(daysSince = 7) {
  const cutoff = new Date(Date.now() - daysSince * 24 * 60 * 60 * 1000).toISOString();

  // Students with no survey in the last `daysSince` days
  const { data: recent } = await supabase
    .from('surveys')
    .select('student_id')
    .gte('submitted_at', cutoff);

  const recentIds = new Set((recent || []).map(r => r.student_id));

  const { data: allStudents } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('role_id', 1);

  const dueStudents = (allStudents || [])
    .map(s => s.id)
    .filter(id => !recentIds.has(id));

  if (!dueStudents.length) {
    logger.info('Survey reminders: no students due');
    return 0;
  }

  await broadcastNotification(
    dueStudents,
    '📋 Weekly Check-In Reminder',
    'It\'s time for your weekly mental health survey. It only takes 2 minutes!',
    'survey_reminder'
  );

  logger.info(`Survey reminders sent to ${dueStudents.length} students`);
  return dueStudents.length;
}

module.exports = {
  createNotification,
  broadcastNotification,
  notifyAllStudents,
  notifyAllCounselors,
  sendSurveyReminders,
};