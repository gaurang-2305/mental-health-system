const { createClient } = require('@supabase/supabase-js');

const supabaseUrl  = process.env.SUPABASE_URL;
const supabaseKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnon = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
}

// Service role client — used for all DB queries, fully bypasses RLS
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Auth client — used ONLY to verify incoming user JWTs
// Uses anon key if available, falls back to service key
const supabaseAuth = createClient(supabaseUrl, supabaseAnon || supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

module.exports = supabase;
module.exports.supabaseAuth = supabaseAuth;