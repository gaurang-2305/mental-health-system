const { analyzeSentiment: grokAnalyzeSentiment } = require('./grokService');
const logger = require('../utils/index');

const POSITIVE_WORDS = [
  'happy', 'great', 'good', 'excited', 'grateful', 'calm', 'peaceful',
  'joy', 'love', 'better', 'wonderful', 'positive', 'hopeful', 'motivated',
  'energetic', 'confident', 'proud', 'relaxed', 'content', 'inspired',
];

const NEGATIVE_WORDS = [
  'sad', 'depressed', 'anxious', 'stress', 'worried', 'angry', 'hopeless',
  'tired', 'awful', 'terrible', 'bad', 'cry', 'hurt', 'lonely', 'afraid',
  'numb', 'empty', 'worthless', 'overwhelmed', 'exhausted', 'frustrated',
];

/**
 * Keyword-based fallback sentiment analysis.
 * Returns { sentiment, score, analysis }
 */
function keywordSentiment(text) {
  const lower    = text.toLowerCase();
  const posCount = POSITIVE_WORDS.filter(w => lower.includes(w)).length;
  const negCount = NEGATIVE_WORDS.filter(w => lower.includes(w)).length;

  if (posCount > negCount) {
    return {
      sentiment: 'positive',
      score:     Math.min(0.95, 0.6 + posCount * 0.05),
      analysis:  'Your entry reflects positive emotions. Keep nurturing these good feelings!',
    };
  }
  if (negCount > posCount) {
    return {
      sentiment: 'negative',
      score:     Math.max(0.05, 0.4 - negCount * 0.05),
      analysis:  'It sounds like you\'re going through a tough time. Remember — it\'s okay to feel this way, and things can get better.',
    };
  }
  return {
    sentiment: 'neutral',
    score:     0.5,
    analysis:  'Your entry has a balanced tone. Journaling regularly can help you track emotional patterns over time.',
  };
}

/**
 * Analyse sentiment of text — tries Grok first, falls back to keywords.
 *
 * @param   {string} text
 * @returns {Promise<{ sentiment: string, score: number, analysis: string }>}
 */
async function analyzeSentiment(text) {
  try {
    const result = await grokAnalyzeSentiment(text);
    return {
      sentiment: result.sentiment || 'neutral',
      score:     Math.max(0, Math.min(1, Number(result.score) || 0.5)),
      analysis:  result.analysis  || null,
    };
  } catch (err) {
    logger.warn(`Sentiment AI failed, using keyword fallback: ${err.message}`);
    return keywordSentiment(text);
  }
}

/**
 * Batch-analyze multiple texts.
 * Returns array of { sentiment, score, analysis } in the same order.
 */
async function batchAnalyzeSentiment(texts) {
  return Promise.all(texts.map(t => analyzeSentiment(t)));
}

/**
 * Get aggregate sentiment stats for a student's journal entries.
 * @param {Array} entries  — array of journal_entry rows
 */
function getSentimentStats(entries) {
  if (!entries?.length) return { positive: 0, neutral: 0, negative: 0, avg_score: null };

  const counts = { positive: 0, neutral: 0, negative: 0 };
  let totalScore = 0;
  let scored     = 0;

  entries.forEach(e => {
    if (e.sentiment) counts[e.sentiment] = (counts[e.sentiment] || 0) + 1;
    if (e.sentiment_score != null) { totalScore += Number(e.sentiment_score); scored++; }
  });

  return {
    ...counts,
    avg_score: scored ? Number((totalScore / scored).toFixed(2)) : null,
    total:     entries.length,
  };
}

module.exports = { analyzeSentiment, batchAnalyzeSentiment, keywordSentiment, getSentimentStats };