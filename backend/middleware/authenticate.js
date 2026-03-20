const supabase = require('../config/supabase');
const { supabaseAuth } = require('../config/supabase');

/**
 * Verifies the Supabase JWT from the Authorization header.
 * Uses supabaseAuth (anon/user-scoped) to verify the token,
 * then uses supabase (service role) to load the profile — bypasses RLS.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the JWT — use auth client so it doesn't pollute service role session
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Load full profile using SERVICE ROLE client — bypasses RLS entirely
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*, roles(name)')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ error: 'User profile not found' });
    }

    req.user     = user;
    req.profile  = profile;
    req.userId   = user.id;
    req.roleId   = profile.role_id;
    req.roleName = profile.roles?.name || 'student';
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authenticate;