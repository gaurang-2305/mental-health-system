import { supabase } from './supabaseClient';

// ─── Registration ────────────────────────────────────────────────────────────

/**
 * Register a new student account.
 * Creates a Supabase Auth user then inserts a user_profiles row.
 *
 * @param {string} email
 * @param {string} password
 * @param {{
 *   full_name: string,
 *   age?: number,
 *   class_year?: string,
 *   phone?: string,
 *   preferred_language?: string
 * }} userData
 * @returns {Promise<{ user, session }>}
 */
export async function registerUser(email, password, userData) {
  // 1. Create auth account
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        // store minimal info in auth metadata for quick access
        full_name: userData.full_name,
      },
    },
  });
  if (error) throw error;

  // 2. Insert profile row (role_id 1 = student)
  if (data.user) {
    const { error: profileError } = await supabase.from('user_profiles').insert({
      id: data.user.id,
      email: email.trim().toLowerCase(),
      full_name: userData.full_name?.trim(),
      age: userData.age ? parseInt(userData.age) : null,
      class_year: userData.class_year?.trim() || null,
      phone: userData.phone?.trim() || null,
      preferred_language: userData.preferred_language || 'en',
      role_id: 1, // student
    });
    if (profileError) throw profileError;
  }

  return data;
}

/**
 * Register a counselor account (admin use only — requires service role key on backend).
 * Call this from a backend route, not directly from the frontend in production.
 */
export async function registerCounselor(email, password, userData) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  if (data.user) {
    const { error: profileError } = await supabase.from('user_profiles').insert({
      id: data.user.id,
      email: email.trim().toLowerCase(),
      full_name: userData.full_name?.trim(),
      phone: userData.phone?.trim() || null,
      preferred_language: userData.preferred_language || 'en',
      role_id: 2, // counselor
    });
    if (profileError) throw profileError;
  }

  return data;
}

// ─── Login / Logout ──────────────────────────────────────────────────────────

/**
 * Sign in with email + password.
 * @returns {Promise<{ user, session }>}
 */
export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * Sign out the current user and clear the local session.
 */
export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ─── Session / Profile ───────────────────────────────────────────────────────

/**
 * Returns the full profile (with role name) for the currently logged-in user.
 * Returns null if no session exists.
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*, roles(name)')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('[authService] Failed to fetch profile:', profileError.message);
    return null;
  }

  return profile;
}

/**
 * Returns the current auth session, or null.
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data?.session ?? null;
}

/**
 * Returns true if there is an active authenticated session.
 */
export async function isAuthenticated() {
  const session = await getSession();
  return session !== null;
}

// ─── Profile Updates ─────────────────────────────────────────────────────────

/**
 * Update a user's profile fields.
 * Only pass the fields you want to change.
 *
 * @param {string} userId
 * @param {{
 *   full_name?: string,
 *   age?: number,
 *   class_year?: string,
 *   phone?: string,
 *   preferred_language?: string,
 *   avatar_url?: string
 * }} updates
 * @returns {Promise<object>} Updated profile row
 */
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('*, roles(name)')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Change the authenticated user's email address.
 * Supabase sends a confirmation email to the new address.
 */
export async function updateEmail(newEmail) {
  const { data, error } = await supabase.auth.updateUser({
    email: newEmail.trim().toLowerCase(),
  });
  if (error) throw error;
  return data;
}

/**
 * Change the authenticated user's password.
 */
export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

// ─── Password Reset ───────────────────────────────────────────────────────────

/**
 * Send a password-reset email.
 * @param {string} email
 * @param {string} [redirectTo] - URL to redirect to after reset (defaults to current origin)
 */
export async function sendPasswordResetEmail(email, redirectTo) {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: redirectTo || `${window.location.origin}/reset-password` }
  );
  if (error) throw error;
}

/**
 * Complete a password reset using the token from the reset email.
 * Call this on the /reset-password page after Supabase redirects back.
 */
export async function confirmPasswordReset(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

// ─── Role Helpers ─────────────────────────────────────────────────────────────

/**
 * Fetch the role name for a given user_id.
 * @param {string} userId
 * @returns {Promise<'student'|'counselor'|'admin'|null>}
 */
export async function getUserRole(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('roles(name)')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data.roles?.name ?? null;
}

/**
 * Fetch all counselors (for appointment booking dropdowns).
 * @returns {Promise<Array<{ id, full_name, email }>>}
 */
export async function getCounselors() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, full_name, email, phone')
    .eq('role_id', 2)
    .order('full_name');

  if (error) throw error;
  return data || [];
}

// ─── Admin ────────────────────────────────────────────────────────────────────

/**
 * Fetch all users with their role names (admin only).
 */
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*, roles(name)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export default {
  registerUser,
  registerCounselor,
  loginUser,
  logoutUser,
  getCurrentUser,
  getSession,
  isAuthenticated,
  updateProfile,
  updateEmail,
  updatePassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  getUserRole,
  getCounselors,
  getAllUsers,
};