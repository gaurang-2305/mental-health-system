const supabase  = require('../config/supabase');
const grok      = require('./grokService');
const { evaluateRisk } = require('./crisisService');
const logger    = require('../utils/index');

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * aiAnalysisService.js
 *
 * Central hub for all AI-driven analysis in MindCare.
 * Each function:
 *   1. Runs the AI analysis (with fallback)
 *   2. Persists results to Supabase
 *   3. Triggers downstream effects (crisis alerts, stress scores, etc.)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Survey Evaluation ────────────────────────────────────────────────────────

/**
 * AI-evaluate a completed survey and compute risk.
 * Saves a stress_score and triggers a crisis alert if needed.
 *
 * @param {string} studentId
 * @param {Object} surveyData  — { mood_score, stress_score, sleep_hours, anxiety_level, responses }
 * @param {string} [studentName]
 * @returns {Promise<{ ai_evaluation, risk_level, stress_score }>}
 */
async function evaluateSurvey(studentId, surveyData, studentName = 'Student') {
  const { mood_score, stress_score, sleep_hours, anxiety_level, responses } = surveyData;

  // Compute numeric stress score (0–100)
  const numericScore = ((stress_score + anxiety_level) / 2) * 10;
  const risk_level   = numericScore >= 75 ? 'critical'
    : numericScore >= 55 ? 'high'
    : numericScore >= 35 ? 'moderate'
    : 'low';

  // AI evaluation — best-effort, never blocks the response
  let ai_evaluation = null;
  try {
    ai_evaluation = await grok.evaluateSurvey({ mood_score, stress_score, sleep_hours, anxiety_level, responses });
  } catch (err) {
    logger.warn(`evaluateSurvey AI skipped for ${studentId}: ${err.message}`);
  }

  // Persist stress score
  await supabase.from('stress_scores').insert({
    student_id: studentId,
    score:      numericScore,
    risk_level,
  });

  // Raise crisis alert if high / critical
  if (['high', 'critical'].includes(risk_level)) {
    await evaluateRisk(
      studentId,
      numericScore,
      studentName,
      'survey'
    );
  }

  return { ai_evaluation, risk_level, stress_score: numericScore };
}

// ─── Symptom Analysis ─────────────────────────────────────────────────────────

/**
 * Run AI symptom analysis and persist the result.
 * Auto-raises a crisis alert when depression or high-confidence anxiety is detected.
 *
 * @param {string}   studentId
 * @param {Object}   input  — { symptoms, duration_days, severity }
 * @param {string}   [studentName]
 * @returns {Promise<Object>}  saved symptom_analysis row
 */
async function analyzeSymptoms(studentId, input, studentName = 'Student') {
  const { symptoms, duration_days, severity } = input;

  let anxiety_detected    = false;
  let depression_detected = false;
  let stress_detected     = false;
  let confidence_score    = 50;
  let analysis_data       = {};

  try {
    const result         = await grok.analyzeSymptoms({ symptoms, duration_days, severity });
    anxiety_detected     = result.anxiety_detected    || false;
    depression_detected  = result.depression_detected || false;
    stress_detected      = result.stress_detected     || false;
    confidence_score     = result.confidence_score    || 60;
    analysis_data        = {
      summary:         result.summary         || '',
      recommendations: result.recommendations || [],
    };
  } catch (err) {
    logger.warn(`analyzeSymptoms AI failed for ${studentId}, using keyword fallback: ${err.message}`);

    // Keyword fallback
    const text = Array.isArray(symptoms) ? symptoms.join(' ').toLowerCase() : String(symptoms).toLowerCase();
    anxiety_detected    = /anxious|worry|panic|nervous|fear/.test(text);
    depression_detected = /sad|hopeless|empty|numb|worthless|depress/.test(text);
    stress_detected     = /stress|overwhelm|pressure|tense|burnout/.test(text);
    confidence_score    = 45;
    analysis_data       = { summary: 'Keyword-based analysis (AI unavailable)', recommendations: [] };
  }

  // Persist
  const { data, error } = await supabase
    .from('symptom_analysis')
    .insert({
      student_id:          studentId,
      anxiety_detected,
      depression_detected,
      stress_detected,
      confidence_score,
      model_used:          'grok',
      analysis_data:       { ...analysis_data, symptoms, duration_days, severity },
    })
    .select()
    .single();

  if (error) {
    logger.error(`analyzeSymptoms DB insert failed: ${error.message}`);
    throw error;
  }

  // Raise alert if depression or high-confidence anxiety
  if (depression_detected || (anxiety_detected && confidence_score > 70)) {
    const riskScore = depression_detected ? 75 : 60;
    await evaluateRisk(studentId, riskScore, studentName, 'symptom_analysis');
  }

  return data;
}

// ─── Sentiment Analysis ───────────────────────────────────────────────────────

/**
 * Analyse journal entry sentiment and return { sentiment, score, analysis }.
 * Uses grokService; falls back to keyword detection.
 *
 * @param {string} text
 * @returns {Promise<{ sentiment: string, score: number, analysis: string|null }>}
 */
async function analyzeJournalSentiment(text) {
  try {
    const result = await grok.analyzeSentiment(text);
    return {
      sentiment: result.sentiment || 'neutral',
      score:     Math.max(0, Math.min(1, Number(result.score) || 0.5)),
      analysis:  result.analysis  || null,
    };
  } catch (err) {
    logger.warn(`analyzeJournalSentiment AI failed, using keywords: ${err.message}`);
    return keywordSentimentFallback(text);
  }
}

function keywordSentimentFallback(text) {
  const lower    = text.toLowerCase();
  const pos      = ['happy', 'great', 'grateful', 'calm', 'joy', 'love', 'hopeful', 'proud', 'relaxed', 'motivated'];
  const neg      = ['sad', 'depressed', 'anxious', 'stress', 'hopeless', 'tired', 'awful', 'hurt', 'numb', 'empty'];
  const posCount = pos.filter(w => lower.includes(w)).length;
  const negCount = neg.filter(w => lower.includes(w)).length;
  if (posCount > negCount) return { sentiment: 'positive', score: Math.min(0.95, 0.6 + posCount * 0.05), analysis: null };
  if (negCount > posCount) return { sentiment: 'negative', score: Math.max(0.05, 0.4 - negCount * 0.05), analysis: null };
  return { sentiment: 'neutral', score: 0.5, analysis: null };
}

// ─── Chatbot ──────────────────────────────────────────────────────────────────

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
  'self-harm', 'hurt myself', 'cut myself', 'overdose', 'no reason to live',
];

const CRISIS_RESPONSE = (name) =>
  `${name}, I'm really glad you reached out. What you're feeling sounds very serious and your life matters deeply. Please contact a crisis helpline right now — iCall: 9152987821 or Vandrevala Foundation: 1860-2662-345 (24/7 free). If you're in immediate danger please call emergency services (112). I'm here, but you deserve professional support immediately.`;

/**
 * Generate a chatbot reply for a student message.
 * Detects crisis keywords and short-circuits to a crisis response if found.
 * Also persists both the user message and AI reply to chat_messages.
 *
 * @param {string}   studentId
 * @param {string}   message
 * @param {string}   studentName
 * @param {Array}    history        — recent chat history [{role, message}]
 * @returns {Promise<{ reply: string, is_crisis: boolean }>}
 */
async function processChatMessage(studentId, message, studentName = 'there', history = []) {
  // Save user message
  await supabase.from('chat_messages').insert({
    student_id: studentId,
    role:       'user',
    message,
  });

  // Crisis detection
  const lowerMsg = message.toLowerCase();
  const isCrisis = CRISIS_KEYWORDS.some(kw => lowerMsg.includes(kw));
  let reply;

  if (isCrisis) {
    reply = CRISIS_RESPONSE(studentName);

    // Raise critical alert
    await evaluateRisk(studentId, 80, studentName, 'chatbot_crisis_keyword');
  } else {
    // Build message array for Grok (last 10 turns)
    const messages = [
      ...history.slice(-10).map(m => ({ role: m.role, content: m.message || m.content })),
      { role: 'user', content: message },
    ];

    try {
      reply = await grok.chatbotReply(messages, studentName);
    } catch (err) {
      logger.warn(`chatbot Grok failed for ${studentId}: ${err.message}`);
      reply = `I'm here for you, ${studentName}. It sounds like you're going through something difficult. Try taking a slow deep breath — inhale for 4 counts, hold for 4, exhale for 6. Would you like to talk more about what's on your mind?`;
    }
  }

  // Save AI reply
  await supabase.from('chat_messages').insert({
    student_id: studentId,
    role:       'assistant',
    message:    reply,
  });

  return { reply, is_crisis: isCrisis };
}

// ─── Recommendation Generation ────────────────────────────────────────────────

/**
 * Generate and persist AI recommendations from a student's latest data.
 * Convenience wrapper — delegates to recommendationService.
 *
 * @param {string} studentId
 */
async function generateRecommendations(studentId) {
  // Dynamic require to avoid circular dependency
  const { generateFromLatestData } = require('./recommendationService');
  return generateFromLatestData(studentId);
}

// ─── Full AI Health Check (runs all analyses for a student at once) ───────────

/**
 * Run a comprehensive AI health check for a student.
 * Useful for the counselor "Student Overview" page or scheduled jobs.
 *
 * @param {string} studentId
 * @param {string} [studentName]
 * @returns {Promise<Object>}
 */
async function runFullHealthCheck(studentId, studentName = 'Student') {
  const results = { studentId, timestamp: new Date().toISOString() };

  // Latest survey evaluation
  try {
    const { data: latestSurvey } = await supabase
      .from('surveys')
      .select('mood_score, stress_score, sleep_hours, anxiety_level, responses')
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();

    if (latestSurvey) {
      results.surveyEvaluation = await evaluateSurvey(studentId, latestSurvey, studentName);
    }
  } catch (err) {
    logger.warn(`runFullHealthCheck survey step failed: ${err.message}`);
  }

  // Latest journal sentiment
  try {
    const { data: latestJournal } = await supabase
      .from('journal_entries')
      .select('content')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (latestJournal) {
      results.journalSentiment = await analyzeJournalSentiment(latestJournal.content);
    }
  } catch (err) {
    logger.warn(`runFullHealthCheck journal step failed: ${err.message}`);
  }

  // Fresh recommendations
  try {
    results.recommendations = await generateRecommendations(studentId);
  } catch (err) {
    logger.warn(`runFullHealthCheck recommendations step failed: ${err.message}`);
  }

  return results;
}

module.exports = {
  evaluateSurvey,
  analyzeSymptoms,
  analyzeJournalSentiment,
  processChatMessage,
  generateRecommendations,
  runFullHealthCheck,
};