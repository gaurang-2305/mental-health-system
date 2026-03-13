const supabase = require('../config/supabase');

// POST /api/goals
async function createGoal(req, res, next) {
  try {
    const { title, description, target_date } = req.body;

    const { data, error } = await supabase
      .from('goals')
      .insert({ student_id: req.userId, title, description, target_date })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ goal: data });
  } catch (err) { next(err); }
}

// GET /api/goals
async function getGoals(req, res, next) {
  try {
    const { completed, student_id } = req.query;
    const targetId = student_id && req.roleId >= 2 ? student_id : req.userId;

    let query = supabase
      .from('goals')
      .select('*')
      .eq('student_id', targetId)
      .order('created_at', { ascending: false });

    if (completed !== undefined) query = query.eq('is_completed', completed === 'true');

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json({ goals: data });
  } catch (err) { next(err); }
}

// PUT /api/goals/:id
async function updateGoal(req, res, next) {
  try {
    const { title, description, target_date, is_completed } = req.body;

    const { data, error } = await supabase
      .from('goals')
      .update({ title, description, target_date, is_completed })
      .eq('id', req.params.id)
      .eq('student_id', req.userId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ goal: data });
  } catch (err) { next(err); }
}

// PATCH /api/goals/:id/complete
async function completeGoal(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('goals')
      .update({ is_completed: true })
      .eq('id', req.params.id)
      .eq('student_id', req.userId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ goal: data, message: 'Goal completed! Great work.' });
  } catch (err) { next(err); }
}

// DELETE /api/goals/:id
async function deleteGoal(req, res, next) {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', req.params.id)
      .eq('student_id', req.userId);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Goal deleted' });
  } catch (err) { next(err); }
}

module.exports = { createGoal, getGoals, updateGoal, completeGoal, deleteGoal };