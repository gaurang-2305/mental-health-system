/**
 * grokApi.js — Grok (xAI) API integration for MindCare
 *
 * Grok is used as an optional secondary AI provider alongside the primary
 * Anthropic Claude backend. It is called directly from the frontend using
 * the VITE_GROK_API_KEY environment variable.
 *
 * To enable: add VITE_GROK_API_KEY=xai-... to your frontend .env file.
 * If the key is absent every function falls back gracefully.
 *
 * Grok API is OpenAI-compatible, so we use the same request shape.
 * Endpoint: https://api.x.ai/v1/chat/completions
 * Model:    grok-beta  (or grok-2-latest for the latest flagship)
 */

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = 'grok-beta';
const API_KEY = import.meta.env.VITE_GROK_API_KEY || '';

// ─── Core request helper ─────────────────────────────────────────────────────

/**
 * Send a chat completion request to the Grok API.
 *
 * @param {Array<{ role: 'system'|'user'|'assistant', content: string }>} messages
 * @param {object} [opts]
 * @param {number} [opts.maxTokens=600]
 * @param {number} [opts.temperature=0.7]
 * @param {string} [opts.model]        - Override the default model
 * @param {AbortSignal} [opts.signal]  - Optional abort signal
 * @returns {Promise<string>} The assistant's reply text
 */
async function grokChat(messages, opts = {}) {
  if (!API_KEY) {
    throw new Error('VITE_GROK_API_KEY is not set. Grok API is unavailable.');
  }

  const { maxTokens = 600, temperature = 0.7, model = GROK_MODEL, signal } = opts;

  const response = await fetch(GROK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: false,
    }),
    signal,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Grok API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Grok API returned an empty response.');
  return content.trim();
}

// ─── Mental-health system prompt ─────────────────────────────────────────────

const MENTAL_HEALTH_SYSTEM = `You are MindCare AI, a compassionate and professional mental health support assistant for college students in India. Your role is to:
- Listen empathetically and validate feelings without judgment
- Offer evidence-based coping strategies (CBT techniques, mindfulness, breathing exercises)
- Encourage students to seek professional help when appropriate
- Provide crisis resources when needed: iCall (9152987821), Vandrevala Foundation (1860-2662-345)
- Keep responses concise, warm, and actionable (under 150 words unless detail is essential)
- Never diagnose conditions or replace professional therapy
- Respond in the same language the student uses (English, Hindi, Gujarati, or Marathi)`;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Send a conversational message to Grok and get a mental-health-aware response.
 *
 * @param {string} userMessage  - The student's latest message
 * @param {Array<{ role: string, content: string }>} [history=[]]  - Prior turns
 * @param {string} [studentContext='']  - Optional JSON summary of student's recent data
 * @param {AbortSignal} [signal]
 * @returns {Promise<string>}
 */
export async function grokSendMessage(userMessage, history = [], studentContext = '', signal) {
  const systemContent = studentContext
    ? `${MENTAL_HEALTH_SYSTEM}\n\nStudent context: ${studentContext}`
    : MENTAL_HEALTH_SYSTEM;

  const messages = [
    { role: 'system', content: systemContent },
    // Include last 10 history turns to stay within context limits
    ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  return grokChat(messages, { maxTokens: 350, temperature: 0.75, signal });
}

/**
 * Analyse the emotional sentiment of a journal entry or short text.
 *
 * @param {string} text
 * @returns {Promise<{ sentiment: 'positive'|'neutral'|'negative', score: number, emotions: string[], summary: string }>}
 */
export async function grokAnalyseSentiment(text) {
  const messages = [
    {
      role: 'system',
      content:
        'You are a sentiment analysis engine. Respond ONLY with valid JSON — no markdown, no explanation. ' +
        'Schema: { "sentiment": "positive"|"neutral"|"negative", "score": <-1 to 1 float>, "emotions": ["<emotion>", ...], "summary": "<one sentence>" }',
    },
    {
      role: 'user',
      content: `Analyse the sentiment of this text:\n\n"${text}"`,
    },
  ];

  try {
    const raw = await grokChat(messages, { maxTokens: 200, temperature: 0.2 });
    // Strip any accidental markdown fences
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    // Graceful fallback
    return keywordSentimentFallback(text);
  }
}

/**
 * Generate personalised mental-health recommendations based on a student's data.
 *
 * @param {{
 *   avgMood?: number,
 *   avgSleep?: number,
 *   stressScore?: number,
 *   riskLevel?: string,
 *   recentMoods?: number[],
 *   exerciseMinutes?: number
 * }} studentData
 * @returns {Promise<Array<{ category: string, content: string, priority: 'high'|'medium'|'low' }>>}
 */
export async function grokGetRecommendations(studentData) {
  const messages = [
    {
      role: 'system',
      content:
        'You are a mental health wellness advisor. Respond ONLY with a JSON array — no markdown, no explanation. ' +
        'Schema: [{ "category": "<string>", "content": "<actionable advice under 60 words>", "priority": "high"|"medium"|"low" }]. ' +
        'Return 4-6 items covering different areas (sleep, exercise, stress, social, mindfulness, academics).',
    },
    {
      role: 'user',
      content: `Generate personalised recommendations for this student:\n${JSON.stringify(studentData, null, 2)}`,
    },
  ];

  try {
    const raw = await grokChat(messages, { maxTokens: 600, temperature: 0.5 });
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed : defaultRecommendations(studentData);
  } catch {
    return defaultRecommendations(studentData);
  }
}

/**
 * Evaluate a survey response and return a short empathetic summary + risk flag.
 *
 * @param {{ moodScore: number, stressScore: number, anxietyScore: number, sleepHours: number, responses: object }} surveyData
 * @returns {Promise<{ summary: string, suggestions: string[], needsAttention: boolean }>}
 */
export async function grokEvaluateSurvey(surveyData) {
  const messages = [
    {
      role: 'system',
      content:
        'You are a compassionate mental health screener. Respond ONLY with valid JSON — no markdown. ' +
        'Schema: { "summary": "<2-3 sentences>", "suggestions": ["<suggestion>", ...], "needsAttention": <boolean> }. ' +
        'needsAttention should be true if scores indicate high stress/low mood requiring counselor follow-up.',
    },
    {
      role: 'user',
      content: `Evaluate this student's daily check-in:\n${JSON.stringify(surveyData, null, 2)}`,
    },
  ];

  try {
    const raw = await grokChat(messages, { maxTokens: 400, temperature: 0.4 });
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return {
      summary: 'Thank you for completing your check-in. Keep tracking your wellbeing daily.',
      suggestions: ['Try a short breathing exercise.', 'Stay hydrated and take regular breaks.'],
      needsAttention: (surveyData.stressScore || 0) > 7 || (surveyData.moodScore || 5) < 4,
    };
  }
}

/**
 * Generate a short motivational message personalised to the student's mood.
 *
 * @param {number} moodScore  1–10
 * @param {string} [name]     Student's first name
 * @returns {Promise<string>}
 */
export async function grokGetMotivation(moodScore, name = '') {
  const greeting = name ? `for ${name}` : 'for a student';
  const messages = [
    {
      role: 'system',
      content:
        'You are a warm, uplifting mental wellness coach. Write a short (2-3 sentence) personalised motivational message. Be genuine, not generic.',
    },
    {
      role: 'user',
      content: `Write a motivational message ${greeting} whose current mood score is ${moodScore}/10.`,
    },
  ];

  try {
    return await grokChat(messages, { maxTokens: 120, temperature: 0.9 });
  } catch {
    return moodScore >= 7
      ? "You're doing great! Keep up the positive energy and remember to celebrate small wins today. 🌟"
      : "It's okay to have tough days. Be kind to yourself — every small step forward counts. You've got this. 💙";
  }
}

/**
 * Check whether the Grok API key is configured and the endpoint is reachable.
 * Returns { available: boolean, model: string|null, error: string|null }
 */
export async function grokHealthCheck() {
  if (!API_KEY) {
    return { available: false, model: null, error: 'API key not configured (VITE_GROK_API_KEY)' };
  }

  try {
    const reply = await grokChat(
      [{ role: 'user', content: 'ping' }],
      { maxTokens: 5, temperature: 0 }
    );
    return { available: true, model: GROK_MODEL, error: null };
  } catch (err) {
    return { available: false, model: null, error: err.message };
  }
}

// ─── Private fallbacks ────────────────────────────────────────────────────────

function keywordSentimentFallback(text) {
  const positive = ['happy', 'good', 'great', 'wonderful', 'joy', 'excited', 'love', 'calm', 'peaceful', 'grateful', 'hopeful'];
  const negative = ['sad', 'bad', 'terrible', 'awful', 'anxious', 'stress', 'depressed', 'angry', 'hate', 'alone', 'hopeless', 'worthless', 'tired'];
  const lower = text.toLowerCase();
  const posCount = positive.filter((w) => lower.includes(w)).length;
  const negCount = negative.filter((w) => lower.includes(w)).length;

  if (posCount > negCount) return { sentiment: 'positive', score: 0.65, emotions: ['hopeful'], summary: 'The text has a generally positive tone.' };
  if (negCount > posCount) return { sentiment: 'negative', score: -0.55, emotions: ['distress'], summary: 'The text has a generally negative tone.' };
  return { sentiment: 'neutral', score: 0, emotions: [], summary: 'The text has a neutral tone.' };
}

function defaultRecommendations(data = {}) {
  const recs = [];
  if ((data.avgMood || 5) < 5) {
    recs.push({ category: 'mental', content: 'Consider scheduling a session with a counselor. Talking to someone can make a real difference.', priority: 'high' });
  }
  if ((data.avgSleep || 7) < 6) {
    recs.push({ category: 'sleep', content: 'Aim for 7–9 hours of sleep. Try going to bed 30 minutes earlier tonight.', priority: 'high' });
  }
  if ((data.stressScore || 0) > 60) {
    recs.push({ category: 'stress', content: 'Practice box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 4 times.', priority: 'high' });
  }
  if ((data.exerciseMinutes || 0) < 20) {
    recs.push({ category: 'exercise', content: 'A 20-minute walk can significantly reduce stress and improve mood. Try one today.', priority: 'medium' });
  }
  recs.push({ category: 'social', content: 'Connect with a friend or classmate today — even a short conversation boosts wellbeing.', priority: 'low' });
  recs.push({ category: 'mindfulness', content: 'Take 5 minutes to journal your thoughts. Writing helps process emotions and reduce anxiety.', priority: 'low' });
  return recs;
}

export default {
  grokSendMessage,
  grokAnalyseSentiment,
  grokGetRecommendations,
  grokEvaluateSurvey,
  grokGetMotivation,
  grokHealthCheck,
};