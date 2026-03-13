const supabase = require('../config/supabase');
const { createNotification } = require('../services/notificationService');

// POST /api/appointments
async function bookAppointment(req, res, next) {
  try {
    const { counselor_id, scheduled_at, notes } = req.body;

    // Check counselor exists and has role 2
    const { data: counselor } = await supabase
      .from('user_profiles')
      .select('id, full_name, role_id')
      .eq('id', counselor_id)
      .eq('role_id', 2)
      .single();

    if (!counselor) return res.status(404).json({ error: 'Counselor not found' });

    // Check no overlapping confirmed appointment for this counselor
    const slotStart = new Date(scheduled_at);
    const slotEnd   = new Date(slotStart.getTime() + 60 * 60 * 1000); // 1-hour slots

    const { data: conflict } = await supabase
      .from('appointments')
      .select('id')
      .eq('counselor_id', counselor_id)
      .in('status', ['pending', 'confirmed'])
      .gte('scheduled_at', slotStart.toISOString())
      .lt('scheduled_at', slotEnd.toISOString())
      .limit(1);

    if (conflict?.length) {
      return res.status(409).json({ error: 'This time slot is already booked. Please choose another.' });
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert({ student_id: req.userId, counselor_id, scheduled_at, notes })
      .select('*, counselor:counselor_id(full_name, email), student:student_id(full_name)')
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Notify the counselor
    await createNotification({
      user_id: counselor_id,
      title:   'New Appointment Request',
      message: `${req.profile.full_name} has requested an appointment on ${new Date(scheduled_at).toLocaleString()}`,
      type:    'appointment',
    });

    res.status(201).json({ appointment: data });
  } catch (err) { next(err); }
}

// GET /api/appointments
async function getAppointments(req, res, next) {
  try {
    const { status, upcoming } = req.query;
    const isStudent   = req.roleId === 1;
    const isCounselor = req.roleId === 2;

    let query = supabase
      .from('appointments')
      .select('*, counselor:counselor_id(id, full_name, email), student:student_id(id, full_name, email)')
      .order('scheduled_at', { ascending: false });

    if (isStudent)        query = query.eq('student_id',   req.userId);
    else if (isCounselor) query = query.eq('counselor_id', req.userId);
    // admin: all

    if (status)   query = query.eq('status', status);
    if (upcoming) query = query.gte('scheduled_at', new Date().toISOString());

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json({ appointments: data });
  } catch (err) { next(err); }
}

// GET /api/appointments/:id
async function getAppointment(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, counselor:counselor_id(full_name, email), student:student_id(full_name, email)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ appointment: data });
  } catch (err) { next(err); }
}

// PATCH /api/appointments/:id
async function updateAppointment(req, res, next) {
  try {
    const { status, notes, scheduled_at } = req.body;
    const updates = {};
    if (status)       updates.status       = status;
    if (notes)        updates.notes        = notes;
    if (scheduled_at) updates.scheduled_at = scheduled_at;

    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', req.params.id)
      .select('*, student:student_id(full_name), counselor:counselor_id(full_name)')
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Notify the other party about status change
    if (status) {
      const notifyId  = req.roleId === 2 ? data.student_id  : data.counselor_id;
      const notifyMsg = req.roleId === 2
        ? `Your appointment has been ${status} by ${req.profile.full_name}`
        : `Appointment status updated to ${status}`;

      await createNotification({ user_id: notifyId, title: 'Appointment Update', message: notifyMsg, type: 'appointment' });
    }

    res.json({ appointment: data });
  } catch (err) { next(err); }
}

// DELETE /api/appointments/:id
async function cancelAppointment(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ appointment: data, message: 'Appointment cancelled' });
  } catch (err) { next(err); }
}

// GET /api/appointments/counselors
async function getCounselors(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, phone')
      .eq('role_id', 2);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ counselors: data });
  } catch (err) { next(err); }
}

module.exports = { bookAppointment, getAppointments, getAppointment, updateAppointment, cancelAppointment, getCounselors };