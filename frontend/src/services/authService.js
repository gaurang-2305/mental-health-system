import { supabase } from './supabaseClient';

// ─── Registration ─────────────────────────────────────────────────────────────
export async function registerUser(email, password, userData) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { full_name: userData.full_name } },
  });
  if (error) throw error;

  if (data.user) {
    const { error: profileError } = await supabase.from('user_profiles').insert({
      id:        data.user.id,
      email:     email.trim().toLowerCase(),
      full_name: userData.full_name?.trim(),
      age:       userData.age ? parseInt(userData.age) : null,
      class:     userData.class?.trim() || null,   // ← 'class' not 'class_year'
      phone:     userData.phone?.trim() || null,
      role_id:   1,
    });
    // Log but don't throw — auth account already created
    if (profileError) console.error('[registerUser] profile insert:', profileError.message);
  }

  return data;
}

// ─── Login / Logout ───────────────────────────────────────────────────────────
export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ─── Session helpers ──────────────────────────────────────────────────────────
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*, roles(name)')
    .eq('id', user.id)
    .single();

  return profile || null;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data?.session ?? null;
}

export async function isAuthenticated() {
  const session = await getSession();
  return session !== null;
}

// ─── Profile Updates ──────────────────────────────────────────────────────────
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

export async function updateEmail(newEmail) {
  const { data, error } = await supabase.auth.updateUser({ email: newEmail.trim().toLowerCase() });
  if (error) throw error;
  return data;
}

export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

// ─── Password Reset ───────────────────────────────────────────────────────────
export async function sendPasswordResetEmail(email, redirectTo) {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: redirectTo || `${window.location.origin}/reset-password` }
  );
  if (error) throw error;
}

export async function confirmPasswordReset(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

// ─── Role helpers ─────────────────────────────────────────────────────────────
export async function getUserRole(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('roles(name)')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return data.roles?.name ?? null;
}

export async function getCounselors() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, full_name, email, phone')
    .eq('role_id', 2)
    .order('full_name');
  if (error) throw error;
  return data || [];
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*, roles(name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export default {
  registerUser, loginUser, logoutUser, getCurrentUser, getSession,
  isAuthenticated, updateProfile, updateEmail, updatePassword,
  sendPasswordResetEmail, confirmPasswordReset, getUserRole,
  getCounselors, getAllUsers,
};