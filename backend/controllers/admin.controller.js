const supabase = require('../config/supabase');

// GET /api/admin/dashboard
async function getDashboard(req, res, next) {
  try {
    const [studentsRes, counselorsRes, alertsRes, appointmentsRes, surveysRes] = await Promise.all([
      supabase.from('user_profiles').select('id', { count: 'exact' }).eq('role_id', 1),
      supabase.from('user_profiles').select('id', { count: 'exact' }).eq('role_id', 2),
      supabase.from('crisis_alerts').select('id', { count: 'exact' }).eq('is_resolved', false),
      supabase.from('appointments').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('surveys').select('id', { count: 'exact' }).gte('submitted_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    // Recent crisis alerts
    const { data: recentAlerts } = await supabase
      .from('crisis_alerts')
      .select('*, student:student_id(full_name, email)')
      .eq('is_resolved', false)
      .order('created_at', { ascending: false })
      .limit(5);

    // Risk distribution this week
    const { data: riskData } = await supabase
      .from('stress_scores')
      .select('risk_level')
      .gte('computed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const riskDistribution = { low: 0, moderate: 0, high: 0, critical: 0 };
    (riskData || []).forEach(r => { if (r.risk_level) riskDistribution[r.risk_level]++; });

    res.json({
      stats: {
        totalStudents:    studentsRes.count   || 0,
        totalCounselors:  counselorsRes.count  || 0,
        openCrisisAlerts: alertsRes.count      || 0,
        pendingAppointments: appointmentsRes.count || 0,
        surveysThisWeek:  surveysRes.count     || 0,
      },
      recentAlerts:    recentAlerts    || [],
      riskDistribution,
    });
  } catch (err) { next(err); }
}

// GET /api/admin/users
async function getUsers(req, res, next) {
  try {
    const { role_id, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('user_profiles')
      .select('*, roles(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (role_id) query = query.eq('role_id', Number(role_id));
    if (search)  query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

    const { data, error, count } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json({ users: data, total: count, page: Number(page), limit: Number(limit) });
  } catch (err) { next(err); }
}

// POST /api/admin/users
async function createUser(req, res, next) {
  try {
    const { email, password, full_name, role = 'student' } = req.body;

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role },
    });

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ user: data.user, message: 'User created successfully' });
  } catch (err) { next(err); }
}

// PUT /api/admin/users/:id
async function updateUser(req, res, next) {
  try {
    const { full_name, age, class: cls, phone, role_id } = req.body;

    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (age !== undefined)       updates.age       = age;
    if (cls !== undefined)       updates.class     = cls;
    if (phone !== undefined)     updates.phone     = phone;
    if (role_id !== undefined)   updates.role_id   = role_id;

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ user: data });
  } catch (err) { next(err); }
}

// DELETE /api/admin/users/:id
async function deleteUser(req, res, next) {
  try {
    // Deleting from auth.users cascades to user_profiles via FK
    const { error } = await supabase.auth.admin.deleteUser(req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'User deleted successfully' });
  } catch (err) { next(err); }
}

// GET /api/admin/analytics
async function getAnalytics(req, res, next) {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const [moodRes, stressRes, surveyRes, sessionRes] = await Promise.all([
      supabase.from('mood_logs').select('mood_score, logged_at').gte('logged_at', since).order('logged_at'),
      supabase.from('stress_scores').select('score, risk_level, computed_at').gte('computed_at', since),
      supabase.from('surveys').select('mood_score, stress_score, anxiety_level, submitted_at').gte('submitted_at', since),
      supabase.from('game_sessions').select('id', { count: 'exact' }).gte('played_at', since),
    ]);

    const moods    = moodRes.data   || [];
    const stresses = stressRes.data || [];
    const surveys  = surveyRes.data || [];

    const avgMood   = moods.length    ? (moods.reduce((s, r) => s + r.mood_score, 0) / moods.length).toFixed(2)           : 0;
    const avgStress = stresses.length ? (stresses.reduce((s, r) => s + Number(r.score), 0) / stresses.length).toFixed(2)  : 0;
    const avgAnxiety = surveys.length ? (surveys.reduce((s, r) => s + (r.anxiety_level || 0), 0) / surveys.length).toFixed(2) : 0;

    const riskBreakdown = { low: 0, moderate: 0, high: 0, critical: 0 };
    stresses.forEach(r => { if (r.risk_level) riskBreakdown[r.risk_level]++; });

    res.json({
      period_days:     Number(days),
      mood_entries:    moods.length,
      surveys_taken:   surveys.length,
      game_sessions:   sessionRes.count || 0,
      averages:        { mood: avgMood, stress: avgStress, anxiety: avgAnxiety },
      risk_breakdown:  riskBreakdown,
      mood_over_time:  moods.map(r => ({ date: r.logged_at, score: r.mood_score })),
    });
  } catch (err) { next(err); }
}

// GET /api/admin/system-stats
async function getSystemStats(req, res, next) {
  try {
    const tables = ['user_profiles', 'surveys', 'mood_logs', 'crisis_alerts', 'appointments', 'journal_entries', 'chat_messages'];

    const counts = await Promise.all(
      tables.map(t => supabase.from(t).select('id', { count: 'exact', head: true }).then(r => ({ table: t, count: r.count || 0 })))
    );

    res.json({
      table_counts: counts,
      timestamp:    new Date().toISOString(),
    });
  } catch (err) { next(err); }
}

module.exports = { getDashboard, getUsers, createUser, updateUser, deleteUser, getAnalytics, getSystemStats };