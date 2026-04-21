/**
 * aiService.js — All AI calls go through the MindCare backend (which uses Grok).
 * No direct API calls from the frontend to Anthropic or Grok.
 * This keeps API keys secure on the server side.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function getAuthHeader() {
  const { supabase } = await import('./supabaseClient');
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token || '';
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// ─── Stress Score (pure client-side, no AI needed) ────────────────────────────
export function calculateStressScore({ mood_score, stress_score, anxiety_level, sleep_hours }) {
  const mood    = mood_score    || 5;
  const stress  = stress_score  || 5;
  const anxiety = anxiety_level || 5;
  const sleep   = sleep_hours   || 7;

  const moodFactor    = ((10 - mood)    / 9) * 30;
  const stressFactor  = ((stress - 1)   / 9) * 35;
  const anxietyFactor = ((anxiety - 1)  / 9) * 25;
  const sleepFactor   = Math.max(0, (7 - sleep) / 7) * 10;

  const score = Math.min(100, Math.max(0, Math.round(moodFactor + stressFactor + anxietyFactor + sleepFactor)));

  let riskLevel;
  if      (score >= 75) riskLevel = 'critical';
  else if (score >= 55) riskLevel = 'high';
  else if (score >= 35) riskLevel = 'moderate';
  else                  riskLevel = 'low';

  return { score, riskLevel };
}

// ─── Generate Recommendations via backend ─────────────────────────────────────
export async function generateRecommendations() {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/recommendations/generate`, {
      method: 'POST',
      headers,
    });
    if (!res.ok) throw new Error(`Server ${res.status}`);
    const data = await res.json();
    return data.recommendations || [];
  } catch (err) {
    console.warn('generateRecommendations error:', err.message);
    return getDefaultRecommendations();
  }
}

// ─── Generate Weekly Report via backend ───────────────────────────────────────
export async function generateWeeklyReport() {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
      headers,
    });
    if (!res.ok) throw new Error(`Server ${res.status}`);
    const data = await res.json();
    return data.report;
  } catch (err) {
    console.warn('generateWeeklyReport error:', err.message);
    return null;
  }
}

// ─── Analyze Symptoms via backend ─────────────────────────────────────────────
export async function analyzeSymptoms(symptoms, duration_days, severity) {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/symptoms/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ symptoms, duration_days, severity }),
    });
    if (!res.ok) throw new Error(`Server ${res.status}`);
    const data = await res.json();
    return data.analysis;
  } catch (err) {
    console.warn('analyzeSymptoms error:', err.message);
    return null;
  }
}

// ─── Submit Survey via backend (gets AI evaluation) ───────────────────────────
export async function evaluateSurvey(surveyData) {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/surveys`, {
      method: 'POST',
      headers,
      body: JSON.stringify(surveyData),
    });
    if (!res.ok) throw new Error(`Server ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('evaluateSurvey error:', err.message);
    return null;
  }
}

// ─── Keyword sentiment fallback (no AI) ───────────────────────────────────────
export function keywordSentiment(text) {
  const lower = (text || '').toLowerCase();

  const posWords = [
    'happy', 'great', 'good', 'excited', 'grateful', 'calm', 'peaceful',
    'joy', 'love', 'better', 'wonderful', 'hopeful', 'proud', 'motivated',
    'relaxed', 'content', 'smile', 'laugh', 'amazing', 'fantastic',
  ];
  const negWords = [
    'sad', 'depressed', 'anxious', 'stress', 'stressed', 'worried', 'angry',
    'hopeless', 'tired', 'awful', 'terrible', 'bad', 'cry', 'hurt', 'alone',
    'scared', 'afraid', 'overwhelmed', 'frustrated', 'numb', 'empty',
    'worthless', 'miserable', 'hate', 'fail', 'exhausted', 'lonely',
  ];

  const posCount = posWords.filter(w => lower.includes(w)).length;
  const negCount = negWords.filter(w => lower.includes(w)).length;

  if (posCount > negCount + 1) {
    return {
      sentiment: 'positive',
      score: Math.min(0.9, 0.62 + posCount * 0.05),
      analysis: 'Your entry reflects genuinely positive emotions. Keep nurturing these feelings!',
    };
  }
  if (negCount > posCount + 1) {
    return {
      sentiment: 'negative',
      score: Math.max(0.1, 0.38 - negCount * 0.04),
      analysis: "Your entry suggests you're going through a tough time. It's okay to feel this way — consider talking to someone you trust.",
    };
  }
  return {
    sentiment: 'neutral',
    score: 0.5,
    analysis: 'Your entry has a balanced, reflective tone. Journaling regularly helps you track emotional patterns.',
  };
}

// ─── Default recommendations fallback ────────────────────────────────────────
function getDefaultRecommendations() {
  return [
    { content: 'Try the 4-7-8 breathing technique: inhale 4 seconds, hold 7, exhale 8. Repeat 3 times when anxious.', category: 'coping', is_read: false },
    { content: 'Take a 20-minute walk today. Physical movement releases endorphins and lifts your mood significantly.', category: 'exercise', is_read: false },
    { content: 'Set a consistent sleep schedule — same bedtime and wake time even on weekends. Aim for 7-8 hours.', category: 'sleep', is_read: false },
    { content: 'Reach out to one friend or family member today, even just a short message. Social connection is vital.', category: 'social', is_read: false },
  ];
}

export default {
  calculateStressScore,
  generateRecommendations,
  generateWeeklyReport,
  analyzeSymptoms,
  evaluateSurvey,
  keywordSentiment,
};