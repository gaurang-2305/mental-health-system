const supabase = require('../config/supabase');

/**
 * Verifies the Supabase JWT from the Authorization header.
 * Attaches req.user (auth user) and req.profile (user_profiles row).
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the JWT with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Load full profile with role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*, roles(name)')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ error: 'User profile not found' });
    }

    req.user    = user;
    req.profile = profile;
    req.userId  = user.id;
    req.roleId  = profile.role_id;
    req.roleName = profile.roles?.name || 'student';
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authenticate;