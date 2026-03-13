const supabase = require('../config/supabase');
const { grokChat } = require('../config/grok');

// Simple keyword sentiment fallback
function keywordSentiment(text) {
  const pos = ['happy', 'great', 'good', 'excited', 'grateful', 'calm', 'peaceful', 'joy', 'love', 'better', 'wonderful', 'positive'];
  const neg = ['sad', 'depressed', 'anxious', 'stress', 'worried', 'angry', 'hopeless', 'tired', 'awful', 'terrible', 'bad', 'cry', 'hurt'];
  const lower = text.toLowerCase();
  const posCount = pos.filter(w => lower.includes(w)).length;
  const negCount = neg.filter(w => lower.includes(w)).length;
  if (posCount > negCount) return { sentiment: 'positive', score: 0.6 + posCount * 0.05 };
  if (negCount > posCount) return { sentiment: 'negative', score: 0.3 - negCount * 0.05 };
  return { sentiment: 'neutral', score: 0.5 };
}

// POST /api/journal
async function createEntry(req, res, next) {
  try {
    const { content } = req.body;

    let sentiment = 'neutral';
    let sentiment_score = 0.5;
    let ai_analysis = null;

    try {
      const aiResponse = await grokChat([{
        role: 'user',
        content: `Analyze this journal entry for sentiment and provide brief supportive feedback (2-3 sentences max). 
Reply in JSON format: {"sentiment": "positive|neutral|negative", "score": 0.0-1.0, "analysis": "..."}\n\nEntry: ${content}`
      }], { max_tokens: 256 });

      const cleaned = aiResponse.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      sentiment       = parsed.sentiment || 'neutral';
      sentiment_score = parsed.score     || 0.5;
      ai_analysis     = parsed.analysis  || null;
    } catch {
      const fallback  = keywordSentiment(content);
      sentiment       = fallback.sentiment;
      sentiment_score = Math.max(0, Math.min(1, fallback.score));
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({ student_id: req.userId, content, sentiment, sentiment_score, ai_analysis })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ entry: data });
  } catch (err) { next(err); }
}

// GET /api/journal
async function getEntries(req, res, next) {
  try {
    const { limit = 20, offset = 0, sentiment } = req.query;

    let query = supabase
      .from('journal_entries')
      .select('*', { count: 'exact' })
      .eq('student_id', req.userId)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (sentiment) query = query.eq('sentiment', sentiment);

    const { data, error, count } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json({ entries: data, total: count });
  } catch (err) { next(err); }
}

// GET /api/journal/:id
async function getEntry(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', req.params.id)
      .eq('student_id', req.userId)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Entry not found' });
    res.json({ entry: data });
  } catch (err) { next(err); }
}

// PUT /api/journal/:id
async function updateEntry(req, res, next) {
  try {
    const { content } = req.body;
    const fallback    = keywordSentiment(content);

    const { data, error } = await supabase
      .from('journal_entries')
      .update({ content, sentiment: fallback.sentiment, sentiment_score: fallback.score })
      .eq('id', req.params.id)
      .eq('student_id', req.userId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ entry: data });
  } catch (err) { next(err); }
}

// DELETE /api/journal/:id
async function deleteEntry(req, res, next) {
  try {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', req.params.id)
      .eq('student_id', req.userId);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Journal entry deleted' });
  } catch (err) { next(err); }
}

module.exports = { createEntry, getEntries, getEntry, updateEntry, deleteEntry };