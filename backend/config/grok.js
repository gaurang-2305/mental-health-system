const axios = require('axios');

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL   = process.env.GROK_MODEL || 'grok-beta';

/**
 * Send a chat completion request to Grok (xAI)
 * @param {Array}  messages  - [{role, content}]
 * @param {Object} opts      - { temperature, max_tokens, system }
 */
async function grokChat(messages, opts = {}) {
  const { temperature = 0.7, max_tokens = 1024, system } = opts;

  const payload = {
    model: GROK_MODEL,
    messages: system
      ? [{ role: 'system', content: system }, ...messages]
      : messages,
    temperature,
    max_tokens,
  };

  const response = await axios.post(GROK_API_URL, payload, {
    headers: {
      Authorization: `Bearer ${process.env.GROK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });

  return response.data.choices[0].message.content;
}

module.exports = { grokChat };