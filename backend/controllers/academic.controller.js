const supabase = require('../config/supabase');

// POST /api/academic
async function addRecord(req, res, next) {
  try {
    const { subject, grade, semester } = req.body;

    const { data, error } = await supabase
      .from('academic_records')
      .insert({ student_id: req.userId, subject, grade, semester })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ record: data });
  } catch (err) { next(err); }
}

// GET /api/academic
async function getRecords(req, res, next) {
  try {
    const { semester, student_id } = req.query;
    const targetId = student_id && req.roleId >= 2 ? student_id : req.userId;

    let query = supabase
      .from('academic_records')
      .select('*')
      .eq('student_id', targetId)
      .order('recorded_at', { ascending: false });

    if (semester) query = query.eq('semester', semester);

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    const avg_grade = data.length
      ? (data.reduce((s, r) => s + Number(r.grade || 0), 0) / data.length).toFixed(2)
      : null;

    res.json({ records: data, avg_grade });
  } catch (err) { next(err); }
}

// PUT /api/academic/:id
async function updateRecord(req, res, next) {
  try {
    const { subject, grade, semester } = req.body;

    const { data, error } = await supabase
      .from('academic_records')
      .update({ subject, grade, semester })
      .eq('id', req.params.id)
      .eq('student_id', req.userId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ record: data });
  } catch (err) { next(err); }
}

// DELETE /api/academic/:id
async function deleteRecord(req, res, next) {
  try {
    const { error } = await supabase
      .from('academic_records')
      .delete()
      .eq('id', req.params.id)
      .eq('student_id', req.userId);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Academic record deleted' });
  } catch (err) { next(err); }
}

module.exports = { addRecord, getRecords, updateRecord, deleteRecord };