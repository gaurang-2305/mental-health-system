const supabase = require('../config/supabase');

// GET /api/students/profile
async function getProfile(req, res, next) {
  try {
    res.json({ profile: req.profile });
  } catch (err) { next(err); }
}

// PUT /api/students/profile
async function updateProfile(req, res, next) {
  try {
    const { full_name, age, class: cls, phone, language_pref } = req.body;

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ full_name, age, class: cls, phone, language_pref, updated_at: new Date() })
      .eq('id', req.userId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ profile: data });
  } catch (err) { next(err); }
}

// GET /api/students/dashboard
async function getDashboard(req, res, next) {
  try {
    const id = req.userId;

    const [moodRes, stressRes, appointmentRes, goalRes, alertRes] = await Promise.all([
      supabase.from('mood_logs').select('*').eq('student_id', id).order('logged_at', { ascending: false }).limit(7),
      supabase.from('stress_scores').select('*').eq('student_id', id).order('computed_at', { ascending: false }).limit(1),
      supabase.from('appointments').select('*, counselor:counselor_id(full_name)').eq('student_id', id).in('status', ['pending', 'confirmed']).order('scheduled_at').limit(3),
      supabase.from('goals').select('*').eq('student_id', id).eq('is_completed', false).limit(5),
      supabase.from('crisis_alerts').select('*').eq('student_id', id).eq('is_resolved', false).limit(1),
    ]);

    res.json({
      recentMoods:       moodRes.data        || [],
      latestStress:      stressRes.data?.[0]  || null,
      upcomingAppointments: appointmentRes.data || [],
      activeGoals:       goalRes.data         || [],
      hasActiveCrisis:   (alertRes.data?.length || 0) > 0,
    });
  } catch (err) { next(err); }
}

// GET /api/students (admin/counselor only)
async function getAllStudents(req, res, next) {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('user_profiles')
      .select('*, roles(name)', { count: 'exact' })
      .eq('role_id', 1)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) return res.status(400).json({ error: error.message });

    res.json({ students: data, total: count, page: Number(page), limit: Number(limit) });
  } catch (err) { next(err); }
}

// GET /api/students/:id (counselor/admin)
async function getStudentById(req, res, next) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*, roles(name)')
      .eq('id', id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Student not found' });
    res.json({ student: data });
  } catch (err) { next(err); }
}

module.exports = { getProfile, updateProfile, getDashboard, getAllStudents, getStudentById };