const supabase = require('../config/supabase');

/**
 * Platform-wide analytics — used by admin dashboard.
 * @param {number} days  — lookback window
 */
async function getPlatformAnalytics(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const [
    studentsRes, counselorsRes,
    moodRes, stressRes, surveyRes,
    crisisRes, appointmentRes,
    journalRes, gameRes,
  ] = await Promise.all([
    supabase.from('user_profiles').select('id, created_at', { count: 'exact' }).eq('role_id', 1),
    supabase.from('user_profiles').select('id', { count: 'exact' }).eq('role_id', 2),
    supabase.from('mood_logs').select('mood_score, logged_at').gte('logged_at', since),
    supabase.from('stress_scores').select('score, risk_level, computed_at').gte('computed_at', since),
    supabase.from('surveys').select('mood_score, stress_score, anxiety_level, submitted_at').gte('submitted_at', since),
    supabase.from('crisis_alerts').select('risk_level, is_resolved, created_at').gte('created_at', since),
    supabase.from('appointments').select('status, scheduled_at').gte('scheduled_at', since),
    supabase.from('journal_entries').select('sentiment', { count: 'exact' }).gte('created_at', since),
    supabase.from('game_sessions').select('duration_minutes', { count: 'exact' }).gte('played_at', since),
  ]);

  const moods   = moodRes.data   || [];
  const stresses = stressRes.data || [];
  const surveys  = surveyRes.data || [];
  const crises   = crisisRes.data || [];
  const appts    = appointmentRes.data || [];

  // Averages
  const avgMood    = moods.length    ? (moods.reduce((s, r)    => s + r.mood_score,       0) / moods.length).toFixed(2)    : null;
  const avgStress  = stresses.length ? (stresses.reduce((s, r) => s + Number(r.score),    0) / stresses.length).toFixed(2) : null;
  const avgAnxiety = surveys.length  ? (surveys.reduce((s, r)  => s + (r.anxiety_level || 0), 0) / surveys.length).toFixed(2) : null;

  // Risk breakdown
  const riskBreakdown = { low: 0, moderate: 0, high: 0, critical: 0 };
  stresses.forEach(r => { if (r.risk_level) riskBreakdown[r.risk_level]++; });

  // Crisis stats
  const openCrises     = crises.filter(c => !c.is_resolved).length;
  const resolvedCrises = crises.filter(c => c.is_resolved).length;

  // Appointment stats
  const apptByStatus = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  appts.forEach(a => { if (a.status) apptByStatus[a.status] = (apptByStatus[a.status] || 0) + 1; });

  // Sentiment breakdown
  const sentimentBreakdown = { positive: 0, neutral: 0, negative: 0 };
  (journalRes.data || []).forEach(j => { if (j.sentiment) sentimentBreakdown[j.sentiment]++; });

  // Mood trend — group by day
  const moodByDay = {};
  moods.forEach(m => {
    const day = m.logged_at?.split('T')[0];
    if (!day) return;
    if (!moodByDay[day]) moodByDay[day] = { total: 0, count: 0 };
    moodByDay[day].total += m.mood_score;
    moodByDay[day].count++;
  });
  const moodTrend = Object.entries(moodByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { total, count }]) => ({ date, avg: Number((total / count).toFixed(1)) }));

  return {
    period_days: days,
    totals: {
      students:        studentsRes.count  || 0,
      counselors:      counselorsRes.count || 0,
      mood_entries:    moods.length,
      surveys_taken:   surveys.length,
      journal_entries: journalRes.count   || 0,
      game_sessions:   gameRes.count      || 0,
      crisis_alerts:   crises.length,
      appointments:    appts.length,
    },
    averages: { mood: avgMood, stress: avgStress, anxiety: avgAnxiety },
    risk_breakdown:      riskBreakdown,
    crisis_stats:        { open: openCrises, resolved: resolvedCrises },
    appointment_stats:   apptByStatus,
    sentiment_breakdown: sentimentBreakdown,
    mood_trend:          moodTrend,
  };
}

/**
 * Per-student analytics summary.
 */
async function getStudentAnalytics(studentId, days = 30) {
  const since     = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const sinceDate = since.split('T')[0];

  const [moodRes, stressRes, sleepRes, goalRes, journalRes] = await Promise.all([
    supabase.from('mood_logs').select('mood_score, logged_at').eq('student_id', studentId).gte('logged_at', since).order('logged_at'),
    supabase.from('stress_scores').select('score, risk_level, computed_at').eq('student_id', studentId).gte('computed_at', since),
    supabase.from('sleep_logs').select('sleep_hours, logged_date').eq('student_id', studentId).gte('logged_date', sinceDate),
    supabase.from('goals').select('is_completed').eq('student_id', studentId),
    supabase.from('journal_entries').select('sentiment, created_at').eq('student_id', studentId).gte('created_at', since),
  ]);

  const moods   = moodRes.data   || [];
  const stresses = stressRes.data || [];
  const sleeps  = sleepRes.data  || [];
  const goals   = goalRes.data   || [];

  const avgMood   = moods.length    ? (moods.reduce((s, r)    => s + r.mood_score,          0) / moods.length).toFixed(1)    : null;
  const avgStress = stresses.length ? (stresses.reduce((s, r) => s + Number(r.score),        0) / stresses.length).toFixed(1) : null;
  const avgSleep  = sleeps.length   ? (sleeps.reduce((s, r)   => s + Number(r.sleep_hours),  0) / sleeps.length).toFixed(1)  : null;

  // Mood trend — compare first vs second half
  let trend = 'stable';
  if (moods.length >= 4) {
    const half   = Math.floor(moods.length / 2);
    const recent = moods.slice(0, half).reduce((s, r) => s + r.mood_score, 0) / half;
    const older  = moods.slice(half).reduce((s, r) => s + r.mood_score, 0)   / half;
    if (recent > older + 0.5)      trend = 'improving';
    else if (recent < older - 0.5) trend = 'declining';
  }

  return {
    period_days: days,
    averages: { mood: avgMood, stress: avgStress, sleep: avgSleep },
    trend,
    goals_total:     goals.length,
    goals_completed: goals.filter(g => g.is_completed).length,
    mood_history:    moods.map(m => ({ date: m.logged_at, score: m.mood_score })),
    risk_breakdown:  { low: 0, moderate: 0, high: 0, critical: 0, ...Object.fromEntries(
      Object.entries(stresses.reduce((acc, s) => { acc[s.risk_level] = (acc[s.risk_level] || 0) + 1; return acc; }, {}))
    )},
  };
}

module.exports = { getPlatformAnalytics, getStudentAnalytics };