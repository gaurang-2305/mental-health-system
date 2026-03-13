const supabase = require('../config/supabase');
const { createNotification } = require('../services/notificationService');

// GET /api/crisis  (counselor/admin — all alerts)
async function getCrisisAlerts(req, res, next) {
  try {
    const { resolved, risk_level, limit = 50 } = req.query;

    let query = supabase
      .from('crisis_alerts')
      .select('*, student:student_id(id, full_name, email, phone), counselor:alerted_counselor_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (resolved !== undefined) query = query.eq('is_resolved', resolved === 'true');
    if (risk_level)             query = query.eq('risk_level', risk_level);

    // Counselors only see their own assigned alerts + unassigned
    if (req.roleId === 2) {
      query = query.or(`alerted_counselor_id.eq.${req.userId},alerted_counselor_id.is.null`);
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json({ alerts: data });
  } catch (err) { next(err); }
}

// GET /api/crisis/my  (student — own alerts)
async function getMyAlerts(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('crisis_alerts')
      .select('*')
      .eq('student_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ alerts: data });
  } catch (err) { next(err); }
}

// POST /api/crisis  (student self-reports or system creates)
async function createAlert(req, res, next) {
  try {
    const { risk_level = 'high', trigger_reason } = req.body;

    // Find available counselor to assign
    const { data: counselors } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('role_id', 2)
      .limit(1);

    const counselor_id = counselors?.[0]?.id || null;

    const { data, error } = await supabase
      .from('crisis_alerts')
      .insert({
        student_id: req.userId,
        risk_level,
        trigger_reason,
        alerted_counselor_id: counselor_id,
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Notify assigned counselor
    if (counselor_id) {
      await createNotification({
        user_id: counselor_id,
        title:   `⚠ Crisis Alert — ${risk_level.toUpperCase()}`,
        message: `Student ${req.profile.full_name} needs immediate attention. Reason: ${trigger_reason || 'Self-reported crisis'}`,
        type:    'crisis_alert',
      });
    }

    res.status(201).json({ alert: data });
  } catch (err) { next(err); }
}

// PATCH /api/crisis/:id/resolve  (counselor/admin)
async function resolveAlert(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('crisis_alerts')
      .update({ is_resolved: true, alerted_counselor_id: req.userId })
      .eq('id', req.params.id)
      .select('*, student:student_id(full_name)')
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Notify student
    await createNotification({
      user_id: data.student_id,
      title:   'Crisis Alert Resolved',
      message: 'Your counselor has reviewed your alert and marked it as resolved. Please reach out if you need further support.',
      type:    'crisis_alert',
    });

    res.json({ alert: data, message: 'Crisis alert resolved' });
  } catch (err) { next(err); }
}

// PATCH /api/crisis/:id/assign  (admin only)
async function assignCounselor(req, res, next) {
  try {
    const { counselor_id } = req.body;

    const { data, error } = await supabase
      .from('crisis_alerts')
      .update({ alerted_counselor_id: counselor_id })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    await createNotification({
      user_id: counselor_id,
      title:   '⚠ Crisis Alert Assigned to You',
      message: 'A crisis alert has been assigned to you. Please review immediately.',
      type:    'crisis_alert',
    });

    res.json({ alert: data });
  } catch (err) { next(err); }
}

module.exports = { getCrisisAlerts, getMyAlerts, createAlert, resolveAlert, assignCounselor };