const axios  = require('axios');
const logger = require('../utils/index');

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL   = process.env.GROK_MODEL || 'grok-beta';

// ─── Core chat function ───────────────────────────────────────────────────────
async function grokChat(messages, opts = {}) {
  const {
    temperature = 0.7,
    max_tokens  = 1024,
    system      = null,
    retries     = 2,
  } = opts;

  const payload = {
    model: GROK_MODEL,
    messages: system
      ? [{ role: 'system', content: system }, ...messages]
      : messages,
    temperature,
    max_tokens,
  };

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(GROK_API_URL, payload, {
        headers: {
          Authorization: `Bearer ${process.env.GROK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
      return response.data.choices[0].message.content;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        logger.warn(`Grok retry ${attempt + 1}/${retries}: ${err.message}`);
      }
    }
  }

  logger.error(`Grok failed after ${retries + 1} attempts: ${lastError.message}`);
  throw lastError;
}

// ─── JSON helper — prompts Grok to return pure JSON, strips fences ───────────
async function grokJSON(prompt, opts = {}) {
  const raw     = await grokChat([{ role: 'user', content: prompt }], { ...opts, temperature: 0.3 });
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

// ─── Reusable prompt templates ────────────────────────────────────────────────

async function evaluateSurvey({ mood_score, stress_score, sleep_hours, anxiety_level, responses }) {
  return grokChat([{
    role: 'user',
    content: `Mental health survey results for a university student:
- Mood: ${mood_score}/10  |  Stress: ${stress_score}/10
- Sleep: ${sleep_hours}h  |  Anxiety: ${anxiety_level}/10
- Additional responses: ${JSON.stringify(responses || {})}

Write a warm, empathetic 2-3 sentence assessment of their current mental state and one specific, actionable suggestion. Do not diagnose. Be encouraging.`,
  }], { max_tokens: 256, temperature: 0.75 });
}

async function analyzeSentiment(text) {
  return grokJSON(`Analyze the sentiment of this journal entry:
"""
${text}
"""
Return ONLY JSON (no markdown): {"sentiment":"positive|neutral|negative","score":0.0-1.0,"analysis":"1-2 supportive sentences"}`, { max_tokens: 256 });
}

async function generateRecommendations({ avgMood, avgSleep, stressRisk, anxiety }) {
  return grokJSON(`Generate 4 personalised mental wellness recommendations for a university student:
- Average mood: ${avgMood}/10
- Average sleep: ${avgSleep}h/night
- Stress risk: ${stressRisk}
- Anxiety level: ${anxiety}/10

Return ONLY a JSON array with exactly 4 objects: [{"content":"...","category":"coping|exercise|sleep|social"}]
Be specific, actionable, and encouraging.`, { max_tokens: 512 });
}

async function generateWeeklySummary({ avg_mood, avg_stress, avg_sleep, high_risk_days, completed_goals, surveys_taken }) {
  return grokChat([{
    role: 'user',
    content: `Write a 3-4 sentence warm and professional weekly mental wellness summary for a university student:
- Average mood: ${avg_mood ?? 'N/A'}/10
- Average stress: ${avg_stress ?? 'N/A'}/100
- Average sleep: ${avg_sleep ?? 'N/A'}h
- High-risk days: ${high_risk_days}
- Goals completed: ${completed_goals}
- Surveys taken: ${surveys_taken}

Highlight positives, gently note areas to improve, be encouraging.`,
  }], { max_tokens: 256, temperature: 0.75 });
}

async function predictMood({ avgMood, avgSleep, avgStress, avgExercise, trend }) {
  return grokJSON(`Predict tomorrow's mood score (1–10) for a university student:
- 14-day avg mood: ${avgMood}/10, trend: ${trend}
- Avg sleep: ${avgSleep}h
- Avg stress: ${avgStress}/100
- Avg exercise: ${avgExercise} min/day

Return ONLY JSON: {"predicted_mood_score":number,"confidence":0-100,"reasoning":"one sentence"}`, { max_tokens: 128 });
}

async function analyzeSymptoms({ symptoms, duration_days, severity }) {
  return grokJSON(`Analyze mental health symptoms for a university student:
Symptoms: ${Array.isArray(symptoms) ? symptoms.join(', ') : symptoms}
Duration: ${duration_days ?? 'unknown'} days  |  Severity: ${severity ?? 5}/10

Return ONLY JSON:
{
  "anxiety_detected": boolean,
  "depression_detected": boolean,
  "stress_detected": boolean,
  "confidence_score": 0-100,
  "summary": "1-2 sentence non-diagnostic assessment",
  "recommendations": ["action1","action2","action3"]
}`, { max_tokens: 384, temperature: 0.3 });
}

async function chatbotReply(messages, studentName = 'there') {
  const SYSTEM = `You are MindCare AI, a compassionate mental health support chatbot for university students.
- Provide empathetic, non-judgmental support
- Offer evidence-based coping strategies (CBT, mindfulness, breathing)
- NEVER diagnose or prescribe medication
- If suicidal ideation or self-harm is mentioned, ALWAYS refer to emergency services and crisis helplines immediately
- Keep responses warm and concise (3-5 sentences)
- Student's name: ${studentName}`;

  return grokChat(messages, { system: SYSTEM, max_tokens: 512, temperature: 0.8 });
}

module.exports = {
  grokChat,
  grokJSON,
  evaluateSurvey,
  analyzeSentiment,
  generateRecommendations,
  generateWeeklySummary,
  predictMood,
  analyzeSymptoms,
  chatbotReply,
};