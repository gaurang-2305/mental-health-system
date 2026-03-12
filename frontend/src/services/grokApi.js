// Grok API calls
import axios from 'axios';

const GROK_API_KEY = import.meta.env.VITE_GROK_KEY;
const GROK_API_URL = 'https://api.grok.ai/v1';

export async function callGrokAPI(messages) {
  try {
    const response = await axios.post(`${GROK_API_URL}/chat/completions`, {
      messages,
      model: 'grok-1',
    }, {
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Grok API error:', error);
    throw error;
  }
}
