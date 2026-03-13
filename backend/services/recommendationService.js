const supabase = require('../config/supabase');
const { generateRecommendations: grokRecs } = require('./grokService');
const logger = require('../utils/index');

const FALLBACK_RECOMMENDATIONS = [
  { content: 'Try the 4-7-8 breathing technique: inhale 4 seconds, hold 7, exhale 8. Repeat 3 times when anxious.', category: 'coping' },
  { content: 'Take a 20-minute walk outside. Physical movement releases endorphins and lifts your mood significantly.', category: 'exercise' },
  { content: 'Set a consistent sleep schedule — same bedtime and wake time even on weekends. Aim for 7-8 hours.', category: 'sleep' },
  { content: 'Reach out to one friend or family member today, even just a short message. Social connection is vital for mental wellbeing.', category: 'social' },
  { content: 'Write down 3 things you\'re grateful for today. Gratitude journaling rewires the brain toward positivity.', category: 'coping' },
  { content: 'Reduce screen time 1 hour before bed and replace it with reading or light stretching.', category: 'sleep' },
  { content: 'Try a 10-minute body scan meditation. Lie down and mentally relax each body part from toes to head.', category: 'coping' },
  { content: 'Join a campus club or group activity this week. New social environments help break cycles of isolation.', category: 'social' },
];

/**
 * Build a personalised recommendation set for a student.
 * Gathers recent data → calls Grok → falls back to static set if AI fails.
 *
 * @param   {string} studentId
 * @returns {Promise<Array<{ content, category }>>}
 */
async function buildRecommendations(studentId) {
  // Pull recent context
  const [moodRes, stressRes, sleepRes, surveyRes] = await Promise.all([
    supabase.from('mood_logs').select('mood_score').eq('student_id', studentId).order('logged_at', { ascending: false }).limit(7),
    supabase.from('stress_scores').select('score, risk_level').eq('student_id', studentId).order('computed_at', { ascending: false }).limit(1),
    supabase.from('sleep_logs').select('sleep_hours').eq('student_id', studentId).order('logged_date', { ascending: false }).limit(7),
    supabase.from('surveys').select('anxiety_level').eq('student_id', studentId).order('submitted_at', { ascending: false }).limit(1),
  ]);

  const avgMood   = moodRes.data?.length
    ? (moodRes.data.reduce((s, r) => s + r.mood_score, 0) / moodRes.data.length).toFixed(1) : 5;
  const avgSleep  = sleepRes.data?.length
    ? (sleepRes.data.reduce((s, r) => s + Number(r.sleep_hours), 0) / sleepRes.data.length).toFixed(1) : 7;
  const stressRisk = stressRes.data?.[0]?.risk_level || 'moderate';
  const anxiety    = surveyRes.data?.[0]?.anxiety_level || 5;

  try {
    const recs = await grokRecs({ avgMood, avgSleep, stressRisk, anxiety });
    if (Array.isArray(recs) && recs.length) return recs;
    throw new Error('Empty AI response');
  } catch (err) {
    logger.warn(`Recommendation AI failed, using fallback: ${err.message}`);
    // Shuffle and return 4 fallback recommendations
    return [...FALLBACK_RECOMMENDATIONS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
  }
}

/**
 * Generate, save, and return recommendations for a student.
 */
async function generateAndSave(studentId) {
  const recs = await buildRecommendations(studentId);

  const rows = recs.map(r => ({
    student_id:   studentId,
    content:      r.content,
    category:     r.category,
    generated_by: 'grok',
  }));

  const { data, error } = await supabase
    .from('recommendations')
    .insert(rows)
    .select();

  if (error) {
    logger.error(`Failed to save recommendations for ${studentId}: ${error.message}`);
    throw error;
  }

  return data;
}

/**
 * Get unread recommendation count for a student.
 */
async function getUnreadCount(studentId) {
  const { count } = await supabase
    .from('recommendations')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .eq('is_read', false);
  return count || 0;
}

module.exports = { buildRecommendations, generateAndSave, getUnreadCount };