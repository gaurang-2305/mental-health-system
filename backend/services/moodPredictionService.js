const supabase = require('../config/supabase');
const { predictMood } = require('./grokService');
const logger   = require('../utils/index');

/**
 * Compute a simple linear trend from an array of mood scores.
 * Returns 'improving' | 'declining' | 'stable'
 */
function computeTrend(scores) {
  if (scores.length < 4) return 'stable';
  const half   = Math.floor(scores.length / 2);
  const recent = scores.slice(0, half).reduce((s, v) => s + v, 0) / half;
  const older  = scores.slice(half).reduce((s, v) => s + v, 0)  / half;
  if (recent > older + 0.5) return 'improving';
  if (recent < older - 0.5) return 'declining';
  return 'stable';
}

/**
 * Formula-based mood prediction fallback (no AI).
 * Adjusts the recent average by sleep, stress, and exercise factors.
 */
function formulaPrediction(avgMood, avgSleep, avgStress, avgExercise) {
  const sleepFactor    = avgSleep  >= 7 ?  0.5 : avgSleep  < 5 ? -1.0 : -0.3;
  const stressFactor   = avgStress >= 70 ? -1.0 : avgStress < 30 ?  0.5 :  0.0;
  const exerciseFactor = avgExercise >= 30 ? 0.5 : 0.0;
  const predicted      = Number(avgMood) + sleepFactor + stressFactor + exerciseFactor;
  return {
    predicted_mood_score: Number(Math.max(1, Math.min(10, predicted)).toFixed(1)),
    model_confidence:     55, // lower confidence for formula
  };
}

/**
 * Gather the last `days` days of student data and build a context object
 * used for both AI prediction and the formula fallback.
 */
async function buildContext(studentId, days = 14) {
  const since     = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const sinceDate = since.split('T')[0];

  const [moodRes, sleepRes, stressRes, lifestyleRes] = await Promise.all([
    supabase.from('mood_logs')
      .select('mood_score, logged_at')
      .eq('student_id', studentId)
      .gte('logged_at', since)
      .order('logged_at', { ascending: false }),
    supabase.from('sleep_logs')
      .select('sleep_hours, sleep_quality')
      .eq('student_id', studentId)
      .gte('logged_date', sinceDate)
      .order('logged_date', { ascending: false }),
    supabase.from('stress_scores')
      .select('score, risk_level')
      .eq('student_id', studentId)
      .gte('computed_at', since)
      .order('computed_at', { ascending: false }),
    supabase.from('lifestyle_logs')
      .select('exercise_minutes')
      .eq('student_id', studentId)
      .gte('logged_date', sinceDate),
  ]);

  const moods     = moodRes.data     || [];
  const sleeps    = sleepRes.data    || [];
  const stresses  = stressRes.data   || [];
  const lifestyle = lifestyleRes.data || [];

  const avg = (arr, key) => arr.length
    ? arr.reduce((s, r) => s + Number(r[key] || 0), 0) / arr.length
    : null;

  const avgMood     = avg(moods, 'mood_score')         ?? 5;
  const avgSleep    = avg(sleeps, 'sleep_hours')        ?? 7;
  const avgStress   = avg(stresses, 'score')            ?? 50;
  const avgExercise = avg(lifestyle, 'exercise_minutes') ?? 0;
  const trend       = computeTrend(moods.map(m => m.mood_score));
  const dataPoints  = moods.length;

  return {
    avgMood:     Number(avgMood.toFixed(1)),
    avgSleep:    Number(avgSleep.toFixed(1)),
    avgStress:   Number(avgStress.toFixed(1)),
    avgExercise: Number(avgExercise.toFixed(0)),
    trend,
    dataPoints,
  };
}

/**
 * Generate a mood prediction for tomorrow and persist it.
 *
 * @param   {string}  studentId
 * @returns {Promise<{ prediction: Object, context: Object }>}
 */
async function generatePrediction(studentId) {
  const context = await buildContext(studentId);
  const { avgMood, avgSleep, avgStress, avgExercise, trend, dataPoints } = context;

  let predicted_mood_score;
  let model_confidence;

  // Need at least 3 mood entries for a meaningful prediction
  if (dataPoints < 3) {
    predicted_mood_score = avgMood;
    model_confidence     = 40;
    logger.info(`moodPredictionService: insufficient data for ${studentId} (${dataPoints} entries) — using average`);
  } else {
    try {
      const aiResult       = await predictMood({ avgMood, avgSleep, avgStress, avgExercise, trend });
      predicted_mood_score = Math.max(1, Math.min(10, Number(aiResult.predicted_mood_score) || avgMood));
      model_confidence     = Math.max(0, Math.min(100, Number(aiResult.confidence) || 60));
    } catch (err) {
      logger.warn(`moodPredictionService AI failed, using formula: ${err.message}`);
      const fallback       = formulaPrediction(avgMood, avgSleep, avgStress, avgExercise);
      predicted_mood_score = fallback.predicted_mood_score;
      model_confidence     = fallback.model_confidence;
    }
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from('mood_predictions')
    .insert({
      student_id:           studentId,
      predicted_mood_score: Number(predicted_mood_score.toFixed(1)),
      prediction_date:      tomorrow.toISOString().split('T')[0],
      model_confidence:     Number(model_confidence.toFixed(1)),
    })
    .select()
    .single();

  if (error) {
    logger.error(`moodPredictionService: DB insert failed for ${studentId}: ${error.message}`);
    throw error;
  }

  return { prediction: data, context };
}

/**
 * Fetch historical predictions for a student.
 *
 * @param {string} studentId
 * @param {number} limit
 */
async function getPredictions(studentId, limit = 14) {
  const { data, error } = await supabase
    .from('mood_predictions')
    .select('*')
    .eq('student_id', studentId)
    .order('prediction_date', { ascending: false })
    .limit(limit);

  if (error) {
    logger.error(`moodPredictionService getPredictions: ${error.message}`);
    return [];
  }
  return data || [];
}

/**
 * Evaluate prediction accuracy by comparing predictions against
 * actual mood logs for the same date.
 *
 * @param   {string} studentId
 * @returns {Promise<{ predictions: number, matched: number, avg_error: number|null }>}
 */
async function evaluateAccuracy(studentId) {
  const { data: predictions } = await supabase
    .from('mood_predictions')
    .select('prediction_date, predicted_mood_score')
    .eq('student_id', studentId)
    .order('prediction_date', { ascending: false })
    .limit(30);

  if (!predictions?.length) return { predictions: 0, matched: 0, avg_error: null };

  let totalError = 0;
  let matched    = 0;

  for (const pred of predictions) {
    const dayStart = `${pred.prediction_date}T00:00:00.000Z`;
    const dayEnd   = `${pred.prediction_date}T23:59:59.999Z`;

    const { data: actuals } = await supabase
      .from('mood_logs')
      .select('mood_score')
      .eq('student_id', studentId)
      .gte('logged_at', dayStart)
      .lte('logged_at', dayEnd);

    if (actuals?.length) {
      const avgActual = actuals.reduce((s, r) => s + r.mood_score, 0) / actuals.length;
      totalError += Math.abs(pred.predicted_mood_score - avgActual);
      matched++;
    }
  }

  return {
    predictions: predictions.length,
    matched,
    avg_error: matched ? Number((totalError / matched).toFixed(2)) : null,
  };
}

module.exports = { generatePrediction, getPredictions, evaluateAccuracy, buildContext, computeTrend };