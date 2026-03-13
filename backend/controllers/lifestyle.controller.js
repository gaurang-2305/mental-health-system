const supabase = require('../config/supabase');

// POST /api/lifestyle
async function logLifestyle(req, res, next) {
  try {
    const { exercise_minutes, exercise_type, diet_quality, water_intake_liters, notes, logged_date } = req.body;

    const { data, error } = await supabase
      .from('lifestyle_logs')
      .insert({
        student_id: req.userId,
        exercise_minutes,
        exercise_type,
        diet_quality,
        water_intake_liters,
        notes,
        logged_date: logged_date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ lifestyleLog: data });
  } catch (err) { next(err); }
}

// GET /api/lifestyle
async function getLifestyleLogs(req, res, next) {
  try {
    const { days = 30, student_id } = req.query;
    const targetId = student_id && req.roleId >= 2 ? student_id : req.userId;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('lifestyle_logs')
      .select('*')
      .eq('student_id', targetId)
      .gte('logged_date', since)
      .order('logged_date', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    const avg_exercise = data.length
      ? Math.round(data.reduce((s, r) => s + (r.exercise_minutes || 0), 0) / data.length)
      : null;

    res.json({ lifestyleLogs: data, avg_exercise_minutes: avg_exercise });
  } catch (err) { next(err); }
}

// PUT /api/lifestyle/:id
async function updateLifestyle(req, res, next) {
  try {
    const { exercise_minutes, exercise_type, diet_quality, water_intake_liters, notes } = req.body;

    const { data, error } = await supabase
      .from('lifestyle_logs')
      .update({ exercise_minutes, exercise_type, diet_quality, water_intake_liters, notes })
      .eq('id', req.params.id)
      .eq('student_id', req.userId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ lifestyleLog: data });
  } catch (err) { next(err); }
}

// DELETE /api/lifestyle/:id
async function deleteLifestyle(req, res, next) {
  try {
    const { error } = await supabase
      .from('lifestyle_logs')
      .delete()
      .eq('id', req.params.id)
      .eq('student_id', req.userId);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Lifestyle log deleted' });
  } catch (err) { next(err); }
}

module.exports = { logLifestyle, getLifestyleLogs, updateLifestyle, deleteLifestyle };