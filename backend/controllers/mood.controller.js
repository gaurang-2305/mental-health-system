const supabase = require('../config/supabase');

// POST /api/mood
async function recordMood(req, res, next) {
  try {
    const { mood_score, mood_emoji, notes } = req.body;

    const { data, error } = await supabase
      .from('mood_logs')
      .insert({ student_id: req.userId, mood_score, mood_emoji, notes })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ mood: data });
  } catch (err) { next(err); }
}

// GET /api/mood
async function getMoodHistory(req, res, next) {
  try {
    const { days = 30, student_id } = req.query;
    const targetId = student_id && req.roleId >= 2 ? student_id : req.userId;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('student_id', targetId)
      .gte('logged_at', since)
      .order('logged_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ moods: data });
  } catch (err) { next(err); }
}

// GET /api/mood/latest
async function getLatestMood(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('student_id', req.userId)
      .order('logged_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return res.json({ mood: null });
    res.json({ mood: data });
  } catch (err) { next(err); }
}

// DELETE /api/mood/:id
async function deleteMood(req, res, next) {
  try {
    const { error } = await supabase
      .from('mood_logs')
      .delete()
      .eq('id', req.params.id)
      .eq('student_id', req.userId);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Mood entry deleted' });
  } catch (err) { next(err); }
}

module.exports = { recordMood, getMoodHistory, getLatestMood, deleteMood };