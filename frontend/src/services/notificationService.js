import { supabase } from './supabaseClient';

/**
 * Fetch notifications for a user
 */
export const getNotifications = async (userId, limit = 50) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

/**
 * Mark a single notification as read
 */
export const markNotificationRead = async (notificationId) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true, updated_at: new Date().toISOString() })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsRead = async (userId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return true;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId) => {
  const { error } = await supabase.from('notifications').delete().eq('id', notificationId);
  if (error) throw error;
  return true;
};

/**
 * Create a notification for a user (admin/counselor only)
 */
export const createNotification = async ({ userId, title, message, type = 'info', link = null }) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert([
      {
        user_id: userId,
        title,
        message,
        type,
        link,
        is_read: false,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Send notification to all students (admin only)
 */
export const broadcastNotification = async ({ title, message, type = 'info' }) => {
  // Fetch all student user IDs
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, role_id')
    .eq('role_id', 1); // students

  if (profileError) throw profileError;
  if (!profiles?.length) return [];

  const notifications = profiles.map((p) => ({
    user_id: p.id,
    title,
    message,
    type,
    is_read: false,
  }));

  const { data, error } = await supabase.from('notifications').insert(notifications).select();
  if (error) throw error;
  return data;
};

/**
 * Subscribe to real-time notifications for a user
 * Returns the subscription channel — call supabase.removeChannel(sub) to unsubscribe
 */
export const subscribeToNotifications = (userId, onNew) => {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNew(payload.new);
      }
    )
    .subscribe();
};

/**
 * Get unread count for a user
 */
export const getUnreadCount = async (userId) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) return 0;
  return count || 0;
};

export default {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  createNotification,
  broadcastNotification,
  subscribeToNotifications,
  getUnreadCount,
};