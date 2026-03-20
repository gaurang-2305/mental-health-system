// frontend/src/services/dataService.js
// FIX: All tables use student_id (not user_id) per schema — updated throughout.
// EXCEPTION: notifications table correctly uses user_id (it's a general notifications table).
// Forum FK hint names updated: !forum_posts_user_id_fkey → !forum_posts_student_id_fkey etc.
import { supabase } from './supabaseClient';

// ─── SYSTEM / ADMIN ────────────────────────────────────────────────────────────

export async function getSystemStats() {
  const [
    { count: totalStudents },
    { count: totalSurveys },
    { count: totalAppointments },
    { count: activeAlerts },
  ] = await Promise.all([
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('role_id', 1),
    supabase.from('surveys').select('id', { count: 'exact', head: true }),
    supabase.from('appointments').select('id', { count: 'exact', head: true }),
    supabase.from('crisis_alerts').select('id', { count: 'exact', head: true }).eq('is_resolved', false),
  ]);
  return { totalStudents, totalSurveys, totalAppointments, activeAlerts };
}

export async function getAllStudents() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*, roles(name)')
    .eq('role_id', 1)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAllCounselors() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, full_name, email')
    .eq('role_id', 2)
    .order('full_name');
  if (error) throw error;
  return data || [];
}

export async function getAllCrisisAlerts() {
  const { data, error } = await supabase
    .from('crisis_alerts')
    .select(`
      *,
      student:user_profiles!crisis_alerts_student_id_fkey(id, full_name, email, class),
      counselor:user_profiles!crisis_alerts_alerted_counselor_id_fkey(id, full_name)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ─── CRISIS ALERTS ─────────────────────────────────────────────────────────────

export async function getCrisisAlerts(counselorId) {
  const query = supabase
    .from('crisis_alerts')
    .select(`
      *,
      student:user_profiles!crisis_alerts_student_id_fkey(id, full_name, email, class)
    `)
    .eq('is_resolved', false)
    .order('created_at', { ascending: false });

  if (counselorId) query.eq('alerted_counselor_id', counselorId);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function resolveCrisisAlert(alertId, notes = '') {
  const { data, error } = await supabase
    .from('crisis_alerts')
    .update({ is_resolved: true, resolved_at: new Date().toISOString(), notes })
    .eq('id', alertId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── APPOINTMENTS ──────────────────────────────────────────────────────────────

export async function getAppointments(userId, role = 'student') {
  const column = role === 'counselor' ? 'counselor_id' : 'student_id';
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      student:user_profiles!appointments_student_id_fkey(id, full_name, email),
      counselor:user_profiles!appointments_counselor_id_fkey(id, full_name, email)
    `)
    .eq(column, userId)
    .order('scheduled_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function bookAppointment(studentId, counselorId, scheduledAt, notes = '') {
  const { data, error } = await supabase
    .from('appointments')
    .insert([{ student_id: studentId, counselor_id: counselorId, scheduled_at: scheduledAt, notes, status: 'pending' }])
    .select(`
      *,
      student:user_profiles!appointments_student_id_fkey(id, full_name, email),
      counselor:user_profiles!appointments_counselor_id_fkey(id, full_name)
    `)
    .single();
  if (error) throw error;
  return data;
}

export async function updateAppointment(appointmentId, status) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', appointmentId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── MOOD ──────────────────────────────────────────────────────────────────────

export async function getMoodLogs(userId, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('mood_logs')
    // FIX: was user_id — schema uses student_id
    .select('*')
    .eq('student_id', userId)
    .gte('logged_at', since)
    .order('logged_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function logMood(userId, score, emoji = null, notes = '') {
  const { data, error } = await supabase
    .from('mood_logs')
    // FIX: was user_id — schema uses student_id
    .insert([{ student_id: userId, mood_score: score, mood_emoji: emoji, notes }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── STRESS ────────────────────────────────────────────────────────────────────

export async function getStressScores(userId, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('stress_scores')
    // FIX: was user_id — schema uses student_id
    .select('*')
    .eq('student_id', userId)
    .gte('computed_at', since)
    .order('computed_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveStressScore(userId, score, riskLevel) {
  const { data, error } = await supabase
    .from('stress_scores')
    // FIX: was user_id — schema uses student_id
    .insert([{ student_id: userId, score, risk_level: riskLevel }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── SLEEP ─────────────────────────────────────────────────────────────────────

export async function getSleepLogs(userId, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('sleep_logs')
    // FIX: was user_id — schema uses student_id
    .select('*')
    .eq('student_id', userId)
    .gte('logged_date', since)
    .order('logged_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function logSleep(userId, { sleep_hours, sleep_quality, bedtime, wake_time, logged_date }) {
  const { data, error } = await supabase
    .from('sleep_logs')
    // FIX: was user_id — schema uses student_id
    .insert([{ student_id: userId, sleep_hours, sleep_quality, bedtime, wake_time, logged_date: logged_date || new Date().toISOString().split('T')[0] }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── GOALS ─────────────────────────────────────────────────────────────────────

export async function getGoals(userId, completed = null) {
  let query = supabase
    .from('goals')
    // FIX: was user_id — schema uses student_id
    .select('*')
    .eq('student_id', userId)
    .order('created_at', { ascending: false });
  if (completed !== null) query = query.eq('is_completed', completed);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createGoal(userId, { title, description, target_date }) {
  const { data, error } = await supabase
    .from('goals')
    // FIX: was user_id — schema uses student_id
    .insert([{ student_id: userId, title, description, target_date, is_completed: false }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function completeGoal(goalId) {
  const { data, error } = await supabase
    .from('goals')
    .update({ is_completed: true })
    .eq('id', goalId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────────
// NOTE: notifications table correctly uses user_id (not student_id) — no change needed

export async function getNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return data || [];
}

export async function markNotificationRead(notificationId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
}

// ─── JOURNAL ───────────────────────────────────────────────────────────────────

export async function getJournalEntries(userId) {
  const { data, error } = await supabase
    .from('journal_entries')
    // FIX: was user_id — schema uses student_id
    .select('*')
    .eq('student_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveJournalEntry(userId, content, sentiment, score, aiAnalysis = '') {
  const { data, error } = await supabase
    .from('journal_entries')
    // FIX: was user_id — schema uses student_id
    .insert([{
      student_id:      userId,
      content,
      sentiment,
      sentiment_score: score,
      ai_analysis:     aiAnalysis,
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── SURVEYS ───────────────────────────────────────────────────────────────────

export async function submitSurvey(userId, { mood_score, stress_score, anxiety_level, sleep_hours, responses }) {
  const { data, error } = await supabase
    .from('surveys')
    // FIX: was user_id — schema uses student_id
    .insert([{
      student_id: userId,
      mood_score,
      stress_score,
      anxiety_level,
      sleep_hours,
      responses,
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── FORUM ─────────────────────────────────────────────────────────────────────

export async function getForumPosts() {
  const { data, error } = await supabase
    .from('forum_posts')
    // FIX: FK hint updated from user_id_fkey to student_id_fkey to match schema
    .select('*, author:user_profiles!forum_posts_student_id_fkey(id, full_name)')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data || [];
}

export async function createForumPost(userId, title, content, isAnonymous = false) {
  const { data, error } = await supabase
    .from('forum_posts')
    // FIX: was user_id — schema uses student_id
    .insert([{ student_id: userId, title, content, is_anonymous: isAnonymous }])
    .select('*, author:user_profiles!forum_posts_student_id_fkey(id, full_name)')
    .single();
  if (error) throw error;
  return data;
}

export async function getForumReplies(postId) {
  const { data, error } = await supabase
    .from('forum_replies')
    // FIX: FK hint updated from user_id_fkey to student_id_fkey
    .select('*, author:user_profiles!forum_replies_student_id_fkey(id, full_name)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createReply(userId, postId, content) {
  const { data, error } = await supabase
    .from('forum_replies')
    // FIX: was user_id — schema uses student_id
    .insert([{ student_id: userId, post_id: postId, content }])
    .select('*, author:user_profiles!forum_replies_student_id_fkey(id, full_name)')
    .single();
  if (error) throw error;
  return data;
}

// ─── LIFESTYLE ─────────────────────────────────────────────────────────────────

export async function getLifestyleLogs(userId) {
  const { data, error } = await supabase
    .from('lifestyle_logs')
    // FIX: was user_id — schema uses student_id
    .select('*')
    .eq('student_id', userId)
    .order('logged_date', { ascending: false })
    .limit(30);
  if (error) throw error;
  return data || [];
}

export async function logLifestyle(userId, { exercise_type, exercise_minutes, diet_quality, water_intake_liters, notes }) {
  const { data, error } = await supabase
    .from('lifestyle_logs')
    // FIX: was user_id — schema uses student_id
    .insert([{
      student_id: userId,
      exercise_type,
      exercise_minutes,
      diet_quality,
      water_intake_liters,
      notes,
      logged_date: new Date().toISOString().split('T')[0],
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── CHATBOT ───────────────────────────────────────────────────────────────────
// NOTE: chat_messages uses student_id in schema AND has 'sent_at' (not created_at)

export async function getChatHistory(userId, limit = 50) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('student_id', userId)
    .order('sent_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function saveChatMessage(userId, message, role = 'user') {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([{ student_id: userId, message, role }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── WEEKLY REPORTS ────────────────────────────────────────────────────────────

export async function getWeeklyReports(userId) {
  const { data, error } = await supabase
    .from('weekly_reports')
    // FIX: was user_id — schema uses student_id
    .select('*')
    .eq('student_id', userId)
    .order('generated_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  return data || [];
}

// ─── FEEDBACK ──────────────────────────────────────────────────────────────────

export async function submitFeedback(userId, rating, message = '') {
  const { data, error } = await supabase
    .from('feedback')
    // FIX: was user_id — schema uses student_id
    .insert([{ student_id: userId, rating, message }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── STRESS RELIEF / GAMES ─────────────────────────────────────────────────────

export async function recordGameSession(userId, gameName, durationMinutes, moodBefore, moodAfter) {
  const { data, error } = await supabase
    .from('game_sessions')
    // FIX: was user_id — schema uses student_id
    .insert([{
      student_id:       userId,
      game_name:        gameName,
      duration_minutes: durationMinutes,
      mood_before:      moodBefore,
      mood_after:       moodAfter,
    }])
    .select()
    .single();
  // Don't throw — game sessions are non-critical
  if (error) console.warn('Failed to record game session:', error.message);
  return data;
}
// ─── RECOMMENDATIONS ───────────────────────────────────────────────────────────
export async function getRecommendations(userId) {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('student_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  return data || [];
}

// ─── ALIASES & MISSING FUNCTIONS ──────────────────────────────────────────────

// Aliases for page components that use different names
export const getMoodHistory = getMoodLogs;
export const recordMood     = logMood;
export const recordSleep    = logSleep;
export const getSleepData   = getSleepLogs;

// Goals — updateGoal (pages use this but only completeGoal exists)
export async function updateGoal(goalId, updates) {
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single();
  if (error) throw error;
  return data;
}



export async function markRecommendationRead(recId) {
  const { error } = await supabase
    .from('recommendations')
    .update({ is_read: true })
    .eq('id', recId);
  if (error) throw error;
}