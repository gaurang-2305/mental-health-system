// frontend/src/services/aiService.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── CHAT ──────────────────────────────────────────────────────────────────────

export async function chatWithAI(messages, context = '') {
  const res = await fetch(`${API_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'AI chat failed');
  }
  const data = await res.json();
  return data.message || data.content || '';
}

// ─── SENTIMENT ANALYSIS ────────────────────────────────────────────────────────

export async function analyzeSentiment(text) {
  try {
    const res = await fetch(`${API_URL}/ai/sentiment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('Sentiment API error');
    const data = await res.json();
    return { sentiment: data.sentiment || 'neutral', score: data.score ?? 0.5 };
  } catch {
    // Fallback: simple keyword-based sentiment
    const lower = text.toLowerCase();
    const positiveWords = ['happy', 'great', 'good', 'amazing', 'wonderful', 'grateful', 'love', 'excited', 'calm', 'peaceful', 'better', 'smile', 'joy', 'hopeful'];
    const negativeWords = ['sad', 'angry', 'anxious', 'stressed', 'worried', 'terrible', 'awful', 'depressed', 'lonely', 'scared', 'hopeless', 'tired', 'overwhelmed', 'panic'];
    const posCount = positiveWords.filter(w => lower.includes(w)).length;
    const negCount = negativeWords.filter(w => lower.includes(w)).length;
    if (posCount > negCount) return { sentiment: 'positive', score: 0.7 };
    if (negCount > posCount) return { sentiment: 'negative', score: 0.3 };
    return { sentiment: 'neutral', score: 0.5 };
  }
}

// ─── STRESS SCORE ──────────────────────────────────────────────────────────────
// Pure client-side calculation — no API call needed

export function calculateStressScore({ mood_score, stress_score, anxiety_level, sleep_hours }) {
  // Normalise inputs (all 1-10 except sleep which is 0-12)
  const moodFactor     = ((10 - mood_score) / 9) * 30;       // low mood → high stress, weight 30
  const stressFactor   = ((stress_score - 1) / 9) * 35;      // high stress → high score, weight 35
  const anxietyFactor  = ((anxiety_level - 1) / 9) * 25;     // high anxiety → high score, weight 25
  const sleepFactor    = Math.max(0, (7 - sleep_hours) / 7) * 10; // less than 7h → higher score, weight 10

  const rawScore = moodFactor + stressFactor + anxietyFactor + sleepFactor;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  let riskLevel;
  if (score < 25)      riskLevel = 'low';
  else if (score < 50) riskLevel = 'moderate';
  else if (score < 75) riskLevel = 'high';
  else                 riskLevel = 'critical';

  return { score, riskLevel };
}

// ─── RECOMMENDATIONS (optional helper used in some pages) ──────────────────────

export async function getAIRecommendations(userId, stressData) {
  try {
    const res = await fetch(`${API_URL}/ai/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, stressData }),
    });
    if (!res.ok) throw new Error('Recommendations API error');
    return await res.json();
  } catch (err) {
    console.warn('AI recommendations unavailable:', err.message);
    return [];
  }
}