const supabase = require('../config/supabase');
const { grokChat } = require('../config/grok');

// POST /api/mood-prediction/generate
async function generatePrediction(req, res, next) {
  try {
    const id = req.userId;

    // Pull last 14 days of data
    const [moodRes, sleepRes, stressRes, lifestyleRes] = await Promise.all([
      supabase.from('mood_logs').select('mood_score, logged_at').eq('student_id', id).order('logged_at', { ascending: false }).limit(14),
      supabase.from('sleep_logs').select('sleep_hours, sleep_quality').eq('student_id', id).order('logged_date', { ascending: false }).limit(14),
      supabase.from('stress_scores').select('score, risk_level').eq('student_id', id).order('computed_at', { ascending: false }).limit(7),
      supabase.from('lifestyle_logs').select('exercise_minutes').eq('student_id', id).order('logged_date', { ascending: false }).limit(7),
    ]);

    const moods     = moodRes.data     || [];
    const sleeps    = sleepRes.data    || [];
    const stresses  = stressRes.data   || [];
    const lifestyle = lifestyleRes.data || [];

    const avgMood     = moods.length    ? (moods.reduce((s, r) => s + r.mood_score, 0)        / moods.length).toFixed(1)    : 5;
    const avgSleep    = sleeps.length   ? (sleeps.reduce((s, r) => s + Number(r.sleep_hours), 0) / sleeps.length).toFixed(1) : 7;
    const avgStress   = stresses.length ? (stresses.reduce((s, r) => s + Number(r.score), 0)  / stresses.length).toFixed(1) : 50;
    const avgExercise = lifestyle.length ? (lifestyle.reduce((s, r) => s + (r.exercise_minutes || 0), 0) / lifestyle.length).toFixed(0) : 0;

    // Trend: compare first half vs second half of mood data
    let trend = 'stable';
    if (moods.length >= 4) {
      const half     = Math.floor(moods.length / 2);
      const recent   = moods.slice(0, half).reduce((s, r) => s + r.mood_score, 0) / half;
      const older    = moods.slice(half).reduce((s, r) => s + r.mood_score, 0)    / half;
      if (recent > older + 0.5)      trend = 'improving';
      else if (recent < older - 0.5) trend = 'declining';
    }

    let predicted_mood_score = Number(avgMood);
    let model_confidence     = 60;

    try {
      const aiResponse = await grokChat([{
        role: 'user',
        content: `Based on a student's recent data, predict their mood score for tomorrow (1-10 scale).
- Average mood (14 days): ${avgMood}/10, trend: ${trend}
- Average sleep: ${avgSleep} hours
- Average stress score: ${avgStress}/100
- Average exercise: ${avgExercise} mins/day

Return ONLY JSON: {"predicted_mood_score": number, "confidence": 0-100, "reasoning": "one sentence"}`
      }], { max_tokens: 128, temperature: 0.3 });

      const cleaned = aiResponse.replace(/```json|```/g, '').trim();
      const parsed  = JSON.parse(cleaned);
      predicted_mood_score = Math.max(1, Math.min(10, Number(parsed.predicted_mood_score) || Number(avgMood)));
      model_confidence     = Math.max(0, Math.min(100, parsed.confidence || 60));
    } catch {
      // Simple formula fallback
      const sleepFactor    = avgSleep >= 7 ? 0.5 : -0.5;
      const stressFactor   = avgStress > 70 ? -1 : avgStress < 30 ? 0.5 : 0;
      const exerciseFactor = avgExercise > 30 ? 0.5 : 0;
      predicted_mood_score = Math.max(1, Math.min(10, Number(avgMood) + sleepFactor + stressFactor + exerciseFactor));
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('mood_predictions')
      .insert({
        student_id:           id,
        predicted_mood_score: Number(predicted_mood_score.toFixed(1)),
        prediction_date:      tomorrow.toISOString().split('T')[0],
        model_confidence:     Number(model_confidence.toFixed(1)),
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ prediction: data, trend, context: { avgMood, avgSleep, avgStress, avgExercise } });
  } catch (err) { next(err); }
}

// GET /api/mood-prediction
async function getPredictions(req, res, next) {
  try {
    const { limit = 7, student_id } = req.query;
    const targetId = student_id && req.roleId >= 2 ? student_id : req.userId;

    const { data, error } = await supabase
      .from('mood_predictions')
      .select('*')
      .eq('student_id', targetId)
      .order('prediction_date', { ascending: false })
      .limit(Number(limit));

    if (error) return res.status(400).json({ error: error.message });
    res.json({ predictions: data });
  } catch (err) { next(err); }
}

module.exports = { generatePrediction, getPredictions };