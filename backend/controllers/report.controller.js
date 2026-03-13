const supabase = require('../config/supabase');
const { grokChat } = require('../config/grok');

// POST /api/reports/generate
async function generateWeeklyReport(req, res, next) {
  try {
    const id       = req.userId;
    const now      = new Date();
    const weekEnd  = new Date(now);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    const since = weekStart.toISOString();

    const [moodRes, stressRes, sleepRes, surveyRes, goalRes] = await Promise.all([
      supabase.from('mood_logs').select('mood_score, logged_at').eq('student_id', id).gte('logged_at', since),
      supabase.from('stress_scores').select('score, risk_level, computed_at').eq('student_id', id).gte('computed_at', since),
      supabase.from('sleep_logs').select('sleep_hours, sleep_quality, logged_date').eq('student_id', id).gte('logged_date', weekStart.toISOString().split('T')[0]),
      supabase.from('surveys').select('mood_score, stress_score, anxiety_level, submitted_at').eq('student_id', id).gte('submitted_at', since),
      supabase.from('goals').select('title, is_completed').eq('student_id', id),
    ]);

    const moods    = moodRes.data   || [];
    const stresses = stressRes.data || [];
    const sleeps   = sleepRes.data  || [];

    const avg_mood   = moods.length    ? Number((moods.reduce((s, r) => s + r.mood_score, 0)          / moods.length).toFixed(2))   : null;
    const avg_stress = stresses.length ? Number((stresses.reduce((s, r) => s + Number(r.score), 0)    / stresses.length).toFixed(2)) : null;
    const avg_sleep  = sleeps.length   ? Number((sleeps.reduce((s, r) => s + Number(r.sleep_hours), 0) / sleeps.length).toFixed(1))  : null;

    const highRiskDays  = stresses.filter(s => ['high', 'critical'].includes(s.risk_level)).length;
    const completedGoals = (goalRes.data || []).filter(g => g.is_completed).length;

    const risk_areas = {
      mood:   avg_mood   !== null && avg_mood < 4   ? 'concerning' : 'normal',
      stress: avg_stress !== null && avg_stress > 70 ? 'high'       : 'normal',
      sleep:  avg_sleep  !== null && avg_sleep < 6   ? 'poor'       : 'normal',
      high_risk_days: highRiskDays,
    };

    let summary = '';
    try {
      summary = await grokChat([{
        role: 'user',
        content: `Write a brief (3-4 sentences), warm and professional weekly mental wellness summary for a university student:
- Average mood: ${avg_mood ?? 'no data'}/10
- Average stress score: ${avg_stress ?? 'no data'}/100
- Average sleep: ${avg_sleep ?? 'no data'} hours
- High-risk days: ${highRiskDays}
- Goals completed: ${completedGoals}
- Mood surveys taken: ${surveyRes.data?.length || 0}

Be encouraging, highlight positives, and gently note areas for improvement.`
      }], { max_tokens: 256 });
    } catch {
      summary = `This week you logged ${moods.length} mood entries with an average score of ${avg_mood ?? 'N/A'}/10. Your average stress level was ${avg_stress ?? 'N/A'}/100 and you averaged ${avg_sleep ?? 'N/A'} hours of sleep. Keep tracking your wellness daily to get more detailed insights.`;
    }

    const { data, error } = await supabase
      .from('weekly_reports')
      .insert({
        student_id: id,
        week_start: weekStart.toISOString().split('T')[0],
        week_end:   weekEnd.toISOString().split('T')[0],
        summary,
        risk_areas,
        avg_mood,
        avg_stress,
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ report: data });
  } catch (err) { next(err); }
}

// GET /api/reports
async function getReports(req, res, next) {
  try {
    const { student_id, limit = 10 } = req.query;
    const targetId = student_id && req.roleId >= 2 ? student_id : req.userId;

    const { data, error } = await supabase
      .from('weekly_reports')
      .select('*')
      .eq('student_id', targetId)
      .order('week_start', { ascending: false })
      .limit(Number(limit));

    if (error) return res.status(400).json({ error: error.message });
    res.json({ reports: data });
  } catch (err) { next(err); }
}

// GET /api/reports/latest
async function getLatestReport(req, res, next) {
  try {
    const { data } = await supabase
      .from('weekly_reports')
      .select('*')
      .eq('student_id', req.userId)
      .order('week_start', { ascending: false })
      .limit(1)
      .single();

    res.json({ report: data || null });
  } catch (err) { next(err); }
}

module.exports = { generateWeeklyReport, getReports, getLatestReport };