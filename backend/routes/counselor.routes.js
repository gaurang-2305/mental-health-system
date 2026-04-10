// backend/routes/counselors.js
// Admin endpoints to create and manage counselor accounts

import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/counselors — List all counselors (admin/student for booking)
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email, created_at, counselor_profiles(*)')
      .eq('role', 'counselor')
      .eq('is_active', true)
      .order('full_name');

    if (error) throw error;
    res.json({ counselors: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch counselors' });
  }
});

// POST /api/counselors — Admin creates a counselor account
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const {
      email, password = 'MindCare@2025', full_name,
      specialization = 'General Counseling',
      qualification = '',
      availability_hours = 'Mon-Fri 9am-5pm',
      max_students = 30
    } = req.body;

    if (!email || !full_name) {
      return res.status(400).json({ error: 'Email and full name are required' });
    }

    // Create Supabase auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: 'counselor' }
    });

    if (authError) return res.status(400).json({ error: authError.message });

    const userId = authData.user.id;

    // Insert into users table
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({ id: userId, email, full_name, role: 'counselor' })
      .select()
      .single();

    if (userError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return res.status(500).json({ error: 'Failed to create user record' });
    }

    // Create counselor profile
    await supabaseAdmin.from('counselor_profiles').insert({
      user_id: userId,
      specialization,
      qualification,
      availability_hours,
      max_students
    });

    res.status(201).json({
      counselor: { ...user, counselor_profiles: [{ specialization, qualification, availability_hours }] },
      temp_password: password,
      message: `Counselor account created. Temporary password: ${password}`
    });
  } catch (err) {
    console.error('Create counselor error:', err);
    res.status(500).json({ error: 'Failed to create counselor' });
  }
});

// PUT /api/counselors/:id — Update counselor profile
router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { full_name, specialization, qualification, availability_hours, max_students, is_active } = req.body;

    if (full_name !== undefined) {
      await supabaseAdmin.from('users').update({ full_name, updated_at: new Date() }).eq('id', req.params.id);
    }
    if (is_active !== undefined) {
      await supabaseAdmin.from('users').update({ is_active }).eq('id', req.params.id);
    }

    await supabaseAdmin.from('counselor_profiles').update({
      specialization, qualification, availability_hours, max_students
    }).eq('user_id', req.params.id);

    res.json({ message: 'Counselor updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update counselor' });
  }
});

// DELETE /api/counselors/:id — Deactivate counselor
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await supabaseAdmin.from('users').update({ is_active: false }).eq('id', req.params.id);
    res.json({ message: 'Counselor deactivated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to deactivate counselor' });
  }
});

// POST /api/counselors/seed — Seed demo counselors (admin only, run once)
router.post('/seed', authenticate, requireRole('admin'), async (req, res) => {
  const demoCounselors = [
    {
      email: 'dr.sharma@mindcare.edu',
      full_name: 'Dr. Priya Sharma',
      specialization: 'Anxiety & Stress Management',
      qualification: 'M.Phil Clinical Psychology, RCI Registered',
      availability_hours: 'Mon, Wed, Fri — 10am to 5pm'
    },
    {
      email: 'dr.mehta@mindcare.edu',
      full_name: 'Dr. Arjun Mehta',
      specialization: 'Academic Stress & Career Counseling',
      qualification: 'M.Sc Psychology, Certified CBT Practitioner',
      availability_hours: 'Tue, Thu — 9am to 6pm'
    },
    {
      email: 'dr.nair@mindcare.edu',
      full_name: 'Dr. Lakshmi Nair',
      specialization: 'Depression & Emotional Wellbeing',
      qualification: 'PhD Psychology, 8 years experience',
      availability_hours: 'Mon–Fri — 2pm to 7pm'
    }
  ];

  const created = [];
  const skipped = [];

  for (const c of demoCounselors) {
    // Check if already exists
    const { data: existing } = await supabaseAdmin.from('users').select('id').eq('email', c.email).single();
    if (existing) { skipped.push(c.email); continue; }

    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: c.email,
        password: 'MindCare@2025',
        email_confirm: true,
        user_metadata: { full_name: c.full_name, role: 'counselor' }
      });

      if (authError) { skipped.push(c.email); continue; }

      const { data: user } = await supabaseAdmin.from('users')
        .insert({ id: authData.user.id, email: c.email, full_name: c.full_name, role: 'counselor' })
        .select().single();

      await supabaseAdmin.from('counselor_profiles').insert({
        user_id: authData.user.id,
        specialization: c.specialization,
        qualification: c.qualification,
        availability_hours: c.availability_hours,
        max_students: 25
      });

      created.push(c.full_name);
    } catch {
      skipped.push(c.email);
    }
  }

  res.json({
    message: `Seeded ${created.length} counselors`,
    created,
    skipped,
    temp_password: 'MindCare@2025'
  });
});

export default router;