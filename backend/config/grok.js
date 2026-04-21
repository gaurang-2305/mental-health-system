const axios = require('axios');

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL   = process.env.GROK_MODEL || 'grok-beta';

/**
 * Core Grok chat completion — all AI features go through here
 * @param {Array}  messages  - [{role, content}]
 * @param {Object} opts      - { temperature, max_tokens, system, retries }
 */
async function grokChat(messages, opts = {}) {
  const { temperature = 0.7, max_tokens = 1024, system, retries = 2 } = opts;

  if (!process.env.GROK_API_KEY) {
    throw new Error('GROK_API_KEY not set in .env');
  }

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
        timeout: 45000, // increased from 30s — Grok can be slow
      });

      const content = response.data.choices[0].message.content;
      if (!content || content.trim() === '') {
        throw new Error('Grok returned empty content');
      }
      return content;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        const delay = 1200 * (attempt + 1); // slightly longer backoff
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

/**
 * Parse JSON from Grok response — strips markdown fences, finds array or object
 */
async function grokJSON(messages, opts = {}) {
  const raw     = await grokChat(messages, { ...opts, temperature: 0.3 });
  const cleaned = raw.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to find JSON object or array
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    const match = arrMatch || objMatch;
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse JSON from Grok response');
  }
}

module.exports = { grokChat, grokJSON };