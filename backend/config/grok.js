// Grok API config
import axios from 'axios';

const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_URL = 'https://api.grok.ai/v1';

export const grokClient = axios.create({
  baseURL: GROK_API_URL,
  headers: {
    'Authorization': `Bearer ${GROK_API_KEY}`,
    'Content-Type': 'application/json',
  },
});
