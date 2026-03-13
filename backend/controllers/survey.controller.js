const supabase = require('../config/supabase');
const { grokChat } = require('../config/grok');

// POST /api/surveys
async function submitSurvey(req, res, next) {
  try {
    const { mood_score, stress_score, sleep_hours, anxiety_level, responses } = req.body;

    // Get AI evaluation from Grok
    let ai_evaluation = null;
    try {
      ai_evaluation = await grokChat([{
        role: 'user',
        content: `Mental health survey results for a student:
- Mood score: ${mood_score}/10
- Stress score: ${stress_score}/10
- Sleep hours: ${sleep_hours}
- Anxiety level: ${anxiety_level}/10
- Responses: ${JSON.stringify(responses)}

Provide a brief, empathetic 2-3 sentence analysis of their mental state and one concrete suggestion. Be warm and supportive.`
      }], { max_tokens: 256 });
    } catch (e) {
      // AI unavailable — continue without evaluation
    }

    const { data, error } = await supabase
      .from('surveys')
      .insert({ student_id: req.userId, mood_score, stress_score, sleep_hours, anxiety_level, responses, ai_evaluation })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Auto-compute stress score
    const score = ((stress_score + anxiety_level) / 2) * 10;
    const risk_level = score >= 75 ? 'critical' : score >= 55 ? 'high' : score >= 35 ? 'moderate' : 'low';

    await supabase.from('stress_scores').insert({
      student_id: req.userId, score, risk_level
    });

    // Trigger crisis alert if critical
    if (risk_level === 'critical' || risk_level === 'high') {
      await supabase.from('crisis_alerts').insert({
        student_id: req.userId,
        risk_level,
        trigger_reason: `Survey: stress=${stress_score}, anxiety=${anxiety_level}`,
      });
    }

    res.status(201).json({ survey: data, risk_level, ai_evaluation });
  } catch (err) { next(err); }
}

// GET /api/surveys
async function getSurveys(req, res, next) {
  try {
    const { student_id, limit = 10 } = req.query;
    const targetId = student_id && req.roleId >= 2 ? student_id : req.userId;

    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('student_id', targetId)
      .order('submitted_at', { ascending: false })
      .limit(Number(limit));

    if (error) return res.status(400).json({ error: error.message });
    res.json({ surveys: data });
  } catch (err) { next(err); }
}

// GET /api/surveys/latest
async function getLatestSurvey(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('student_id', req.userId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return res.json({ survey: null });
    res.json({ survey: data });
  } catch (err) { next(err); }
}

module.exports = { submitSurvey, getSurveys, getLatestSurvey };