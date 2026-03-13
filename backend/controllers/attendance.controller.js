const supabase = require('../config/supabase');

// POST /api/attendance
async function logAttendance(req, res, next) {
  try {
    const { date, is_present = true, notes } = req.body;
    const logDate = date || new Date().toISOString().split('T')[0];

    // Upsert — one record per student per day
    const { data, error } = await supabase
      .from('attendance_logs')
      .upsert(
        { student_id: req.userId, date: logDate, is_present, notes },
        { onConflict: 'student_id,date' }
      )
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ attendance: data });
  } catch (err) { next(err); }
}

// GET /api/attendance
async function getAttendance(req, res, next) {
  try {
    const { days = 30, student_id } = req.query;
    const targetId = student_id && req.roleId >= 2 ? student_id : req.userId;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('student_id', targetId)
      .gte('date', since)
      .order('date', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    const total    = data.length;
    const present  = data.filter(r => r.is_present).length;
    const rate     = total > 0 ? ((present / total) * 100).toFixed(1) : null;

    res.json({ attendance: data, summary: { total, present, absent: total - present, attendance_rate: rate } });
  } catch (err) { next(err); }
}

// GET /api/attendance/today
async function getTodayAttendance(req, res, next) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('student_id', req.userId)
      .eq('date', today)
      .single();

    res.json({ attendance: data || null });
  } catch (err) { next(err); }
}

module.exports = { logAttendance, getAttendance, getTodayAttendance };