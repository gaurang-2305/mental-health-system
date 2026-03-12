// All Grok AI calls (chat, NLP, ML)
import { grokClient } from '../config/grok.js';

export async function callGrokChat(messages) {
  try {
    const response = await grokClient.post('/chat/completions', {
      messages,
      model: 'grok-1',
    });
    return response.data;
  } catch (error) {
    console.error('Grok API error:', error);
    throw error;
  }
}

export async function analyzeSentiment(text) {
  return callGrokChat([
    { role: 'system', content: 'Analyze sentiment' },
    { role: 'user', content: text },
  ]);
}
