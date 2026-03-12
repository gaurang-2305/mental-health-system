// Grok NLP calls
export async function chatWithBot(req, res) {
  try {
    res.json({ message: 'Chat processed' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
