// frontend/src/services/aiService.js
// Uses Grok API (xAI) for all AI features with real validation and meaningful responses

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = 'grok-beta';

// ─── Core Grok request ────────────────────────────────────────────────────────
async function grokRequest(messages, opts = {}) {
  const apiKey = import.meta.env.VITE_GROK_API_KEY;
  if (!apiKey) throw new Error('VITE_GROK_API_KEY is not configured');

  const { maxTokens = 512, temperature = 0.5, system } = opts;

  const allMessages = system
    ? [{ role: 'system', content: system }, ...messages]
    : messages;

  const res = await fetch(GROK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROK_MODEL,
      messages: allMessages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Grok API ${res.status}: ${err}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from Grok');
  return content.trim();
}

async function grokJSON(messages, opts = {}) {
  const raw = await grokRequest(messages, { ...opts, temperature: 0.3 });
  const clean = raw.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    const match = clean.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse JSON from Grok response');
  }
}

// ─── Input quality gate ───────────────────────────────────────────────────────
// Detects gibberish / meaningless input to avoid wasting AI calls
function assessInputQuality(text) {
  if (!text || text.trim().length < 5) {
    return { valid: false, reason: 'too_short' };
  }

  const cleaned = text.trim().toLowerCase();

  // Too many repeated characters: "aaaaaaa", "zzzzz"
  if (/(.)\1{5,}/.test(cleaned)) {
    return { valid: false, reason: 'repeated_chars' };
  }

  // Keyboard mashing patterns: "asdfgh", "qwerty", "zxcvbn"
  if (/^[asdfghjklqwertyuiopzxcvbnm]{6,}$/.test(cleaned.replace(/\s/g, '')) &&
      !/[aeiou]/.test(cleaned)) {
    return { valid: false, reason: 'keyboard_mash' };
  }

  // Entirely numbers/symbols
  if (/^[^a-zA-Z\u0900-\u097F]+$/.test(cleaned)) {
    return { valid: false, reason: 'no_words' };
  }

  // Very short with no vowels (gibberish words)
  const words = cleaned.split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0 && cleaned.length < 15) {
    return { valid: false, reason: 'no_recognizable_content' };
  }

  return { valid: true };
}

// ─── Sentiment Analysis ───────────────────────────────────────────────────────
export async function analyzeSentiment(text) {
  const quality = assessInputQuality(text);
  if (!quality.valid) {
    return {
      sentiment: 'neutral',
      score: 0.5,
      analysis: null,
      isGibberish: true,
      message: "Your entry seems to contain random text. Please write about your actual thoughts and feelings for meaningful insights.",
    };
  }

  try {
    const result = await grokJSON([{
      role: 'user',
      content: `Analyze the emotional sentiment of this journal entry written by a university student.

Journal entry: "${text}"

Be accurate and honest — if the entry is positive analyze it as positive, if negative then negative.
Do NOT default to neutral or positive if the content is clearly negative.

Return ONLY this JSON (no markdown):
{
  "sentiment": "positive" | "neutral" | "negative",
  "score": <0.0-1.0 where 0=very negative, 0.5=neutral, 1.0=very positive>,
  "analysis": "<2-3 warm, supportive sentences acknowledging the actual emotional content>",
  "emotions": ["<detected emotion 1>", "<detected emotion 2>"]
}`,
    }], { maxTokens: 300 });

    return {
      sentiment: result.sentiment || 'neutral',
      score: Math.max(0, Math.min(1, Number(result.score) || 0.5)),
      analysis: result.analysis || null,
      emotions: result.emotions || [],
      isGibberish: false,
    };
  } catch (err) {
    console.warn('Grok sentiment failed, using keyword fallback:', err.message);
    return keywordSentimentFallback(text);
  }
}

function keywordSentimentFallback(text) {
  const lower = text.toLowerCase();
  const posWords = ['happy', 'great', 'good', 'excited', 'grateful', 'calm', 'peaceful', 'joy', 'love', 'better', 'wonderful', 'hopeful', 'proud', 'motivated', 'relaxed', 'content', 'smile', 'laugh', 'amazing', 'fantastic'];
  const negWords = ['sad', 'depressed', 'anxious', 'stress', 'stressed', 'worried', 'angry', 'hopeless', 'tired', 'awful', 'terrible', 'bad', 'cry', 'hurt', 'alone', 'scared', 'afraid', 'overwhelmed', 'frustrated', 'numb', 'empty', 'worthless', 'miserable', 'hate', 'fail', 'exhausted', 'lonely'];

  const posCount = posWords.filter(w => lower.includes(w)).length;
  const negCount = negWords.filter(w => lower.includes(w)).length;

  if (posCount > negCount + 1) {
    return { sentiment: 'positive', score: Math.min(0.9, 0.62 + posCount * 0.05), analysis: 'Your entry reflects genuinely positive emotions. Wonderful — keep nurturing these feelings!', emotions: ['hopeful', 'content'], isGibberish: false };
  }
  if (negCount > posCount + 1) {
    return { sentiment: 'negative', score: Math.max(0.1, 0.38 - negCount * 0.04), analysis: 'Your entry suggests you\'re going through a tough time. It\'s okay to feel this way — consider reaching out to someone you trust.', emotions: ['distressed', 'concerned'], isGibberish: false };
  }
  return { sentiment: 'neutral', score: 0.5, analysis: 'Your entry has a reflective, balanced tone. Journaling regularly helps you track patterns in your emotional wellbeing.', emotions: ['reflective'], isGibberish: false };
}

// ─── AI Recommendations ───────────────────────────────────────────────────────
export async function generateRecommendations(context) {
  const { avgMood = 5, avgSleep = 7, stressRisk = 'moderate', anxiety = 5, userId } = context;

  // Validate that we have some real data
  const hasRealData = avgMood !== 5 || avgSleep !== 7 || stressRisk !== 'moderate' || anxiety !== 5;

  try {
    const result = await grokJSON([{
      role: 'user',
      content: `Generate 4 personalised mental wellness recommendations for a university student with this data:
- Average mood: ${avgMood}/10
- Average sleep: ${avgSleep} hours/night
- Stress risk: ${stressRisk}
- Anxiety level: ${anxiety}/10
- Data available: ${hasRealData ? 'yes, based on real tracked data' : 'limited — using defaults'}

IMPORTANT: Make recommendations SPECIFIC to the data. 
- If mood is below 5, address low mood directly
- If sleep is below 6, prioritize sleep hygiene
- If stress is high/critical, prioritize immediate coping strategies
- If data is limited, recommend starting to track

Return ONLY a JSON array with exactly 4 objects:
[{"content": "<specific, actionable advice in 1-2 sentences>", "category": "coping|exercise|sleep|social"}]

Be specific and warm. Never give generic advice if you have real data to work with.`,
    }], { maxTokens: 600 });

    if (!Array.isArray(result) || result.length === 0) throw new Error('Invalid response format');
    return result;
  } catch (err) {
    console.warn('Grok recommendations failed, using contextual fallback:', err.message);
    return contextualRecommendationFallback({ avgMood, avgSleep, stressRisk, anxiety });
  }
}

function contextualRecommendationFallback({ avgMood, avgSleep, stressRisk, anxiety }) {
  const recs = [];

  if (avgMood < 5) {
    recs.push({ content: `Your mood has been below average (${avgMood}/10). Try scheduling one enjoyable activity today — even 15 minutes of something you love can shift your mood significantly.`, category: 'coping' });
  } else if (avgMood >= 7) {
    recs.push({ content: `Your mood is great at ${avgMood}/10! Maintain this momentum by continuing whatever routines are working for you. Consider journaling about what's going well.`, category: 'coping' });
  } else {
    recs.push({ content: 'Practice the 4-7-8 breathing technique: inhale 4 seconds, hold 7, exhale 8. Repeat 3 times when feeling stressed or overwhelmed.', category: 'coping' });
  }

  if (avgSleep < 6) {
    recs.push({ content: `You're averaging only ${avgSleep} hours of sleep — significantly below the recommended 7-9 hours. Set a strict bedtime tonight and avoid screens 1 hour before bed.`, category: 'sleep' });
  } else if (avgSleep < 7) {
    recs.push({ content: `Your sleep (${avgSleep}h avg) could be better. Try going to bed 30 minutes earlier and keeping a consistent wake time, even on weekends.`, category: 'sleep' });
  } else {
    recs.push({ content: `Your sleep schedule looks healthy at ${avgSleep} hours average. Protect this by maintaining consistent sleep and wake times.`, category: 'sleep' });
  }

  if (stressRisk === 'critical' || stressRisk === 'high') {
    recs.push({ content: `Your stress is at ${stressRisk} level. Take a 20-minute walk today — physical movement reduces cortisol rapidly and improves mood within minutes.`, category: 'exercise' });
  } else {
    recs.push({ content: 'Aim for 20-30 minutes of moderate exercise today. Even a brisk walk releases endorphins that counter stress and improve emotional regulation.', category: 'exercise' });
  }

  if (anxiety > 6) {
    recs.push({ content: `With anxiety at ${anxiety}/10, try the 5-4-3-2-1 grounding technique: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This interrupts the anxiety cycle.`, category: 'social' });
  } else {
    recs.push({ content: 'Reach out to one friend or family member today — a short conversation or message can significantly boost your sense of connection and support.', category: 'social' });
  }

  return recs;
}

// ─── Survey Evaluation ────────────────────────────────────────────────────────
export async function evaluateSurvey({ mood_score, stress_score, anxiety_level, sleep_hours, responses }) {
  try {
    return await grokRequest([{
      role: 'user',
      content: `A university student just completed a mental health check-in with these scores:
- Mood: ${mood_score}/10
- Stress: ${stress_score}/10
- Anxiety: ${anxiety_level}/10
- Sleep last night: ${sleep_hours} hours

Write a warm, honest 2-3 sentence assessment of their current mental state and one specific actionable suggestion.
Be empathetic but accurate — if scores are poor, acknowledge it honestly with care.
Do NOT be falsely positive if the data shows distress. Do not diagnose.`,
    }], { maxTokens: 200, temperature: 0.6 });
  } catch (err) {
    // Contextual fallback based on actual scores
    const avgScore = (mood_score + (10 - stress_score) + (10 - anxiety_level)) / 3;
    if (avgScore >= 7) return `Your check-in scores look healthy today — mood at ${mood_score}/10 with manageable stress and anxiety. Keep up the positive habits that got you here. Try to maintain your ${sleep_hours >= 7 ? 'good' : 'sleep'} schedule tonight.`;
    if (avgScore >= 5) return `Your scores suggest a mixed day with some stress and anxiety to manage. Mood at ${mood_score}/10 is okay, but stress (${stress_score}/10) and anxiety (${anxiety_level}/10) deserve attention. Consider a short mindfulness break or brief walk to reset.`;
    return `Your check-in reveals significant stress (${stress_score}/10) and anxiety (${anxiety_level}/10) with lower mood (${mood_score}/10) — it sounds like a tough period. Please don't push through alone; reaching out to a counselor or a trusted person can make a real difference right now.`;
  }
}

// ─── Chatbot ──────────────────────────────────────────────────────────────────
const CHATBOT_SYSTEM = `You are MindCare AI, a compassionate mental health support companion for university students in India.

Your role:
- Listen empathetically and validate feelings WITHOUT judgment
- Offer evidence-based coping strategies (CBT, mindfulness, breathing)
- Be honest — if a student is clearly struggling, acknowledge it genuinely
- Keep responses warm, concise (3-5 sentences), and actionable
- NEVER diagnose medical conditions or prescribe medication
- NEVER give false reassurance — if someone is clearly in distress, say so with care
- For suicidal ideation or self-harm: ALWAYS recommend immediate professional help

Crisis resources India:
- iCall: 9152987821
- Vandrevala Foundation: 1860-2662-345 (24/7 free)
- Emergency: 112`;

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
  'self-harm', 'hurt myself', 'cut myself', 'overdose', 'no reason to live',
  'ending it all', 'can\'t go on',
];

export async function chatbotSendMessage(userMessage, history = [], studentName = 'there') {
  const isCrisis = CRISIS_KEYWORDS.some(kw => userMessage.toLowerCase().includes(kw));

  if (isCrisis) {
    return {
      reply: `${studentName}, I'm genuinely concerned about what you've shared and I'm really glad you reached out. Your life matters deeply. Please contact a crisis helpline right now — iCall: 9152987821 or Vandrevala Foundation: 1860-2662-345 (both free, 24/7). If you're in immediate danger, call 112. I'm here with you, but you deserve real human support right now. 💙`,
      isCrisis: true,
    };
  }

  try {
    const messages = [
      ...history.slice(-8).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ];

    const reply = await grokRequest(messages, {
      system: CHATBOT_SYSTEM + `\n\nStudent's name: ${studentName}`,
      maxTokens: 400,
      temperature: 0.75,
    });

    return { reply, isCrisis: false };
  } catch (err) {
    return {
      reply: `${studentName}, I hear you and I'm here. It sounds like you're going through something real right now. Try a slow deep breath with me — inhale for 4 counts, hold for 4, exhale for 6. Would you like to talk more about what's been on your mind?`,
      isCrisis: false,
    };
  }
}

// ─── Mood Prediction ──────────────────────────────────────────────────────────
export async function predictMood({ avgMood, avgSleep, avgStress, avgExercise, trend }) {
  try {
    const result = await grokJSON([{
      role: 'user',
      content: `Predict tomorrow's mood score (1-10) for a student based on their recent data:
- 14-day average mood: ${avgMood}/10, trend: ${trend}
- Average sleep: ${avgSleep} hours/night
- Average stress score: ${avgStress}/100
- Average exercise: ${avgExercise} minutes/day

Return ONLY JSON: {"predicted_mood_score": <1-10 number>, "confidence": <0-100>, "reasoning": "<one sentence>"}`,
    }], { maxTokens: 128 });

    return {
      predicted_mood_score: Math.max(1, Math.min(10, Number(result.predicted_mood_score) || avgMood)),
      confidence: Math.max(0, Math.min(100, Number(result.confidence) || 55)),
      reasoning: result.reasoning || '',
    };
  } catch {
    // Formula fallback
    const sleepFactor = avgSleep >= 7 ? 0.4 : avgSleep < 5 ? -0.8 : -0.2;
    const stressFactor = avgStress >= 70 ? -0.9 : avgStress < 30 ? 0.4 : 0;
    const exFactor = avgExercise >= 30 ? 0.4 : 0;
    const trendFactor = trend === 'improving' ? 0.3 : trend === 'declining' ? -0.3 : 0;
    const predicted = Math.max(1, Math.min(10, avgMood + sleepFactor + stressFactor + exFactor + trendFactor));
    return { predicted_mood_score: +predicted.toFixed(1), confidence: 50, reasoning: 'Based on sleep, stress, and exercise data.' };
  }
}

// ─── Weekly Report Summary ────────────────────────────────────────────────────
export async function generateWeeklySummary({ avg_mood, avg_stress, avg_sleep, high_risk_days, completed_goals, surveys_taken }) {
  const hasData = surveys_taken > 0 || avg_mood !== null;
  if (!hasData) {
    return `You haven't logged much data this week — that's okay! Start by tracking your mood and completing a daily survey. Even 2-3 minutes a day gives MindCare enough to provide meaningful insights and personalised support.`;
  }

  try {
    return await grokRequest([{
      role: 'user',
      content: `Write a brief (3-4 sentences), warm and professional weekly mental wellness summary for a university student:
- Average mood: ${avg_mood ?? 'no data'}/10
- Average stress: ${avg_stress ?? 'no data'}/100
- Average sleep: ${avg_sleep ?? 'no data'} hours
- High-risk days: ${high_risk_days}
- Goals completed: ${completed_goals}
- Surveys taken: ${surveys_taken}

Be honest and specific to the numbers. Highlight genuine positives, and gently but clearly note areas needing attention. If stress is high, say so. Be encouraging but not falsely positive.`,
    }], { maxTokens: 200, temperature: 0.6 });
  } catch {
    const moodStr = avg_mood !== null ? `${avg_mood}/10` : 'N/A';
    const stressStr = avg_stress !== null ? `${avg_stress}/100` : 'N/A';
    const sleepStr = avg_sleep !== null ? `${avg_sleep}h` : 'N/A';
    return `This week you logged ${surveys_taken} survey${surveys_taken !== 1 ? 's' : ''} with an average mood of ${moodStr}${avg_stress > 60 ? ` — your stress score of ${stressStr} deserves attention` : ''}. ${avg_sleep !== null && avg_sleep < 7 ? `Sleep averaging ${sleepStr} is below the recommended 7-9 hours.` : ''} ${completed_goals > 0 ? `Great work completing ${completed_goals} goal${completed_goals > 1 ? 's' : ''} this week!` : ''} Keep tracking daily to build more meaningful insights over time.`;
  }
}

// ─── Stress Score (pure client-side) ─────────────────────────────────────────
export function calculateStressScore({ mood_score, stress_score, anxiety_level, sleep_hours }) {
  const moodFactor    = ((10 - (mood_score || 5)) / 9) * 30;
  const stressFactor  = (((stress_score || 5) - 1) / 9) * 35;
  const anxietyFactor = (((anxiety_level || 5) - 1) / 9) * 25;
  const sleepFactor   = Math.max(0, (7 - (sleep_hours || 7)) / 7) * 10;

  const rawScore = moodFactor + stressFactor + anxietyFactor + sleepFactor;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  let riskLevel;
  if (score < 25)      riskLevel = 'low';
  else if (score < 50) riskLevel = 'moderate';
  else if (score < 75) riskLevel = 'high';
  else                 riskLevel = 'critical';

  return { score, riskLevel };
}

export default {
  analyzeSentiment,
  generateRecommendations,
  evaluateSurvey,
  chatbotSendMessage,
  predictMood,
  generateWeeklySummary,
  calculateStressScore,
};