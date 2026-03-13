const supabase = require('../config/supabase');

// GET /api/counselor/dashboard
async function getDashboard(req, res, next) {
  try {
    const counselorId = req.userId;

    const [alertRes, appointmentRes, studentCountRes] = await Promise.all([
      supabase.from('crisis_alerts').select('*, student:student_id(full_name, email)').eq('is_resolved', false).or(`alerted_counselor_id.eq.${counselorId},alerted_counselor_id.is.null`).order('created_at', { ascending: false }).limit(10),
      supabase.from('appointments').select('*, student:student_id(full_name)').eq('counselor_id', counselorId).in('status', ['pending', 'confirmed']).order('scheduled_at').limit(10),
      supabase.from('user_profiles').select('id', { count: 'exact' }).eq('role_id', 1),
    ]);

    res.json({
      openAlerts:          alertRes.data          || [],
      upcomingAppointments: appointmentRes.data   || [],
      totalStudents:       studentCountRes.count  || 0,
    });
  } catch (err) { next(err); }
}

// GET /api/counselor/students/:id/overview
async function getStudentOverview(req, res, next) {
  try {
    const { id } = req.params;

    const [profile, moods, stress, sleep, surveys, alerts, appointments] = await Promise.all([
      supabase.from('user_profiles').select('*, roles(name)').eq('id', id).single(),
      supabase.from('mood_logs').select('mood_score, logged_at').eq('student_id', id).order('logged_at', { ascending: false }).limit(14),
      supabase.from('stress_scores').select('score, risk_level, computed_at').eq('student_id', id).order('computed_at', { ascending: false }).limit(7),
      supabase.from('sleep_logs').select('sleep_hours, sleep_quality').eq('student_id', id).order('logged_date', { ascending: false }).limit(7),
      supabase.from('surveys').select('mood_score, stress_score, anxiety_level, submitted_at').eq('student_id', id).order('submitted_at', { ascending: false }).limit(5),
      supabase.from('crisis_alerts').select('*').eq('student_id', id).order('created_at', { ascending: false }).limit(5),
      supabase.from('appointments').select('*, counselor:counselor_id(full_name)').eq('student_id', id).order('scheduled_at', { ascending: false }).limit(5),
    ]);

    if (!profile.data) return res.status(404).json({ error: 'Student not found' });

    const avgMood   = moods.data?.length ? (moods.data.reduce((s, r) => s + r.mood_score, 0) / moods.data.length).toFixed(1) : null;
    const avgStress = stress.data?.length ? (stress.data.reduce((s, r) => s + Number(r.score), 0) / stress.data.length).toFixed(1) : null;

    res.json({
      profile:      profile.data,
      recentMoods:  moods.data  || [],
      stressScores: stress.data || [],
      sleepLogs:    sleep.data  || [],
      surveys:      surveys.data || [],
      crisisAlerts: alerts.data  || [],
      appointments: appointments.data || [],
      summary:      { avgMood, avgStress },
    });
  } catch (err) { next(err); }
}

// GET /api/counselor/stress-reports
async function getStressReports(req, res, next) {
  try {
    const { risk_level, limit = 50 } = req.query;

    let query = supabase
      .from('stress_scores')
      .select('*, student:student_id(full_name, email, class)')
      .order('computed_at', { ascending: false })
      .limit(Number(limit));

    if (risk_level) query = query.eq('risk_level', risk_level);

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json({ reports: data });
  } catch (err) { next(err); }
}

// GET /api/counselor/student-status
async function getStudentStatus(req, res, next) {
  try {
    // Get all students with their latest mood and stress
    const { data: students, error } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, class')
      .eq('role_id', 1)
      .order('full_name');

    if (error) return res.status(400).json({ error: error.message });

    // For each student get latest mood & stress
    const enriched = await Promise.all(students.map(async student => {
      const [mood, stress] = await Promise.all([
        supabase.from('mood_logs').select('mood_score, logged_at').eq('student_id', student.id).order('logged_at', { ascending: false }).limit(1).single(),
        supabase.from('stress_scores').select('risk_level, computed_at').eq('student_id', student.id).order('computed_at', { ascending: false }).limit(1).single(),
      ]);
      return {
        ...student,
        latest_mood:   mood.data   || null,
        latest_stress: stress.data || null,
      };
    }));

    res.json({ students: enriched });
  } catch (err) { next(err); }
}

// POST /api/counselor/notes/:student_id
async function addNote(req, res, next) {
  try {
    const { note } = req.body;
    // Store as a notification to the student (reusing notifications table)
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: req.params.student_id,
        title:   `Note from your counselor`,
        message: note,
        type:    'counselor_note',
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ note: data });
  } catch (err) { next(err); }
}

module.exports = { getDashboard, getStudentOverview, getStressReports, getStudentStatus, addNote };