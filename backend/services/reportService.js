const supabase = require('../config/supabase');
const { generateWeeklySummary } = require('./grokService');
const logger = require('../utils/index');

/**
 * Gather all data for a student for the past 7 days.
 */
async function gatherWeeklyData(studentId) {
  const now       = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  const since     = weekStart.toISOString();
  const sinceDateOnly = weekStart.toISOString().split('T')[0];

  const [moodRes, stressRes, sleepRes, surveyRes, goalRes, lifestyleRes, journalRes] = await Promise.all([
    supabase.from('mood_logs').select('mood_score, logged_at').eq('student_id', studentId).gte('logged_at', since),
    supabase.from('stress_scores').select('score, risk_level, computed_at').eq('student_id', studentId).gte('computed_at', since),
    supabase.from('sleep_logs').select('sleep_hours, sleep_quality, logged_date').eq('student_id', studentId).gte('logged_date', sinceDateOnly),
    supabase.from('surveys').select('mood_score, stress_score, anxiety_level').eq('student_id', studentId).gte('submitted_at', since),
    supabase.from('goals').select('title, is_completed').eq('student_id', studentId),
    supabase.from('lifestyle_logs').select('exercise_minutes').eq('student_id', studentId).gte('logged_date', sinceDateOnly),
    supabase.from('journal_entries').select('sentiment').eq('student_id', studentId).gte('created_at', since),
  ]);

  const moods     = moodRes.data     || [];
  const stresses  = stressRes.data   || [];
  const sleeps    = sleepRes.data    || [];
  const surveys   = surveyRes.data   || [];
  const goals     = goalRes.data     || [];
  const lifestyle = lifestyleRes.data || [];
  const journals  = journalRes.data  || [];

  const avg_mood   = moods.length    ? Number((moods.reduce((s, r)    => s + r.mood_score,             0) / moods.length).toFixed(2))    : null;
  const avg_stress = stresses.length ? Number((stresses.reduce((s, r) => s + Number(r.score),          0) / stresses.length).toFixed(2)) : null;
  const avg_sleep  = sleeps.length   ? Number((sleeps.reduce((s, r)   => s + Number(r.sleep_hours),    0) / sleeps.length).toFixed(1))   : null;
  const avg_exercise = lifestyle.length
    ? Math.round(lifestyle.reduce((s, r) => s + (r.exercise_minutes || 0), 0) / lifestyle.length)
    : null;

  const high_risk_days   = stresses.filter(s => ['high', 'critical'].includes(s.risk_level)).length;
  const completed_goals  = goals.filter(g => g.is_completed).length;
  const sentiment_counts = { positive: 0, neutral: 0, negative: 0 };
  journals.forEach(j => { if (j.sentiment) sentiment_counts[j.sentiment]++; });

  const risk_areas = {
    mood:            avg_mood   !== null && avg_mood   < 4   ? 'concerning' : 'normal',
    stress:          avg_stress !== null && avg_stress > 70  ? 'high'       : 'normal',
    sleep:           avg_sleep  !== null && avg_sleep  < 6   ? 'poor'       : 'normal',
    high_risk_days,
  };

  return {
    weekStart,
    weekEnd: now,
    avg_mood,
    avg_stress,
    avg_sleep,
    avg_exercise,
    high_risk_days,
    completed_goals,
    surveys_taken:  surveys.length,
    mood_entries:   moods.length,
    risk_areas,
    sentiment_counts,
  };
}

/**
 * Generate, save and return a weekly report for a student.
 */
async function generateReport(studentId) {
  const data = await gatherWeeklyData(studentId);

  let summary;
  try {
    summary = await generateWeeklySummary({
      avg_mood:       data.avg_mood,
      avg_stress:     data.avg_stress,
      avg_sleep:      data.avg_sleep,
      high_risk_days: data.high_risk_days,
      completed_goals: data.completed_goals,
      surveys_taken:  data.surveys_taken,
    });
  } catch (err) {
    logger.warn(`Report AI summary failed, using fallback: ${err.message}`);
    summary = `This week you logged ${data.mood_entries} mood entries with an average score of ${data.avg_mood ?? 'N/A'}/10. ` +
              `Your average stress level was ${data.avg_stress ?? 'N/A'}/100 and you averaged ${data.avg_sleep ?? 'N/A'} hours of sleep per night. ` +
              `Keep tracking your wellness daily to unlock deeper insights and personalised recommendations.`;
  }

  const { data: report, error } = await supabase
    .from('weekly_reports')
    .insert({
      student_id: studentId,
      week_start: data.weekStart.toISOString().split('T')[0],
      week_end:   data.weekEnd.toISOString().split('T')[0],
      summary,
      risk_areas: data.risk_areas,
      avg_mood:   data.avg_mood,
      avg_stress: data.avg_stress,
    })
    .select()
    .single();

  if (error) {
    logger.error(`Failed to save weekly report for ${studentId}: ${error.message}`);
    throw error;
  }

  return { report, stats: data };
}

/**
 * Auto-generate reports for ALL students — called by cron job.
 */
async function generateAllReports() {
  const { data: students } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('role_id', 1);

  if (!students?.length) return 0;

  let success = 0;
  for (const student of students) {
    try {
      await generateReport(student.id);
      success++;
    } catch (err) {
      logger.error(`Failed weekly report for ${student.id}: ${err.message}`);
    }
  }

  logger.info(`Weekly reports generated: ${success}/${students.length}`);
  return success;
}

module.exports = { gatherWeeklyData, generateReport, generateAllReports };