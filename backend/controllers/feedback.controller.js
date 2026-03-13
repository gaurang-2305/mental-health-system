const supabase = require('../config/supabase');

// POST /api/feedback
async function submitFeedback(req, res, next) {
  try {
    const { rating, message } = req.body;

    const { data, error } = await supabase
      .from('feedback')
      .insert({ student_id: req.userId, rating, message })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ feedback: data, message: 'Thank you for your feedback!' });
  } catch (err) { next(err); }
}

// GET /api/feedback (counselor/admin)
async function getFeedback(req, res, next) {
  try {
    const { limit = 50, min_rating } = req.query;

    let query = supabase
      .from('feedback')
      .select('*, student:student_id(full_name)', { count: 'exact' })
      .order('submitted_at', { ascending: false })
      .limit(Number(limit));

    if (min_rating) query = query.gte('rating', Number(min_rating));

    const { data, error, count } = await query;
    if (error) return res.status(400).json({ error: error.message });

    const avg_rating = data.length
      ? (data.reduce((s, r) => s + r.rating, 0) / data.length).toFixed(1)
      : null;

    res.json({ feedback: data, total: count, avg_rating });
  } catch (err) { next(err); }
}

// GET /api/feedback/my
async function getMyFeedback(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('student_id', req.userId)
      .order('submitted_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ feedback: data });
  } catch (err) { next(err); }
}

module.exports = { submitFeedback, getFeedback, getMyFeedback };