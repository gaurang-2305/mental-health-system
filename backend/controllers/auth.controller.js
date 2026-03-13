const supabase = require('../config/supabase');
const logger   = require('../utils/index');

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { email, password, full_name, role = 'student' } = req.body;

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role },
    });

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ message: 'User registered successfully', userId: data.user.id });
  } catch (err) { next(err); }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*, roles(name)')
      .eq('id', data.user.id)
      .single();

    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: { ...data.user, profile },
    });
  } catch (err) { next(err); }
}

// POST /api/auth/logout
async function logout(req, res, next) {
  try {
    await supabase.auth.signOut();
    res.json({ message: 'Logged out successfully' });
  } catch (err) { next(err); }
}

// POST /api/auth/refresh
async function refreshToken(req, res, next) {
  try {
    const { refresh_token } = req.body;
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });
    if (error) return res.status(401).json({ error: error.message });
    res.json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
  } catch (err) { next(err); }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Password reset email sent' });
  } catch (err) { next(err); }
}

// PUT /api/auth/update-password
async function updatePassword(req, res, next) {
  try {
    const { password } = req.body;
    const { error } = await supabase.auth.admin.updateUserById(req.userId, { password });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Password updated successfully' });
  } catch (err) { next(err); }
}

// GET /api/auth/me
async function me(req, res) {
  res.json({ user: req.user, profile: req.profile });
}

module.exports = { register, login, logout, refreshToken, forgotPassword, updatePassword, me };