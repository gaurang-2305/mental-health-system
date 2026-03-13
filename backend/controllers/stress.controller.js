const supabase = require('../config/supabase');

// POST /api/stress
async function saveStressScore(req, res, next) {
  try {
    const { score, risk_level } = req.body;

    const { data, error } = await supabase
      .from('stress_scores')
      .insert({ student_id: req.userId, score, risk_level })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Auto-generate crisis alert for high/critical
    if (['high', 'critical'].includes(risk_level)) {
      await supabase.from('crisis_alerts').insert({
        student_id: req.userId,
        risk_level,
        trigger_reason: `Stress score: ${score}`,
      });
    }

    res.status(201).json({ stressScore: data });
  } catch (err) { next(err); }
}

// GET /api/stress
async function getStressScores(req, res, next) {
  try {
    const { student_id, days = 30 } = req.query;
    const targetId = student_id && req.roleId >= 2 ? student_id : req.userId;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('stress_scores')
      .select('*')
      .eq('student_id', targetId)
      .gte('computed_at', since)
      .order('computed_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ stressScores: data });
  } catch (err) { next(err); }
}

// GET /api/stress/latest
async function getLatestStress(req, res, next) {
  try {
    const { data } = await supabase
      .from('stress_scores')
      .select('*')
      .eq('student_id', req.userId)
      .order('computed_at', { ascending: false })
      .limit(1)
      .single();

    res.json({ stressScore: data || null });
  } catch (err) { next(err); }
}

module.exports = { saveStressScore, getStressScores, getLatestStress };