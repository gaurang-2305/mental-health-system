const supabase = require('../config/supabase');

// POST /api/sleep
async function recordSleep(req, res, next) {
  try {
    const { sleep_hours, sleep_quality, bedtime, wake_time, logged_date } = req.body;

    const { data, error } = await supabase
      .from('sleep_logs')
      .insert({ student_id: req.userId, sleep_hours, sleep_quality, bedtime, wake_time, logged_date: logged_date || new Date().toISOString().split('T')[0] })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ sleepLog: data });
  } catch (err) { next(err); }
}

// GET /api/sleep
async function getSleepLogs(req, res, next) {
  try {
    const { days = 30, student_id } = req.query;
    const targetId = student_id && req.roleId >= 2 ? student_id : req.userId;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('student_id', targetId)
      .gte('logged_date', since)
      .order('logged_date', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    // Compute averages
    const avg_hours   = data.length ? (data.reduce((s, r) => s + Number(r.sleep_hours || 0), 0) / data.length).toFixed(1) : null;
    const avg_quality = data.length ? (data.reduce((s, r) => s + Number(r.sleep_quality || 0), 0) / data.length).toFixed(1) : null;

    res.json({ sleepLogs: data, avg_hours, avg_quality });
  } catch (err) { next(err); }
}

// GET /api/sleep/latest
async function getLatestSleep(req, res, next) {
  try {
    const { data } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('student_id', req.userId)
      .order('logged_date', { ascending: false })
      .limit(1)
      .single();

    res.json({ sleepLog: data || null });
  } catch (err) { next(err); }
}

// PUT /api/sleep/:id
async function updateSleep(req, res, next) {
  try {
    const { sleep_hours, sleep_quality, bedtime, wake_time } = req.body;

    const { data, error } = await supabase
      .from('sleep_logs')
      .update({ sleep_hours, sleep_quality, bedtime, wake_time })
      .eq('id', req.params.id)
      .eq('student_id', req.userId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ sleepLog: data });
  } catch (err) { next(err); }
}

// DELETE /api/sleep/:id
async function deleteSleep(req, res, next) {
  try {
    const { error } = await supabase
      .from('sleep_logs')
      .delete()
      .eq('id', req.params.id)
      .eq('student_id', req.userId);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Sleep log deleted' });
  } catch (err) { next(err); }
}

module.exports = { recordSleep, getSleepLogs, getLatestSleep, updateSleep, deleteSleep };