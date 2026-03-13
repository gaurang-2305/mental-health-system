const supabase = require('../config/supabase');

// GET /api/notifications
async function getNotifications(req, res, next) {
  try {
    const { unread_only, limit = 30 } = req.query;

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (unread_only === 'true') query = query.eq('is_read', false);

    const { data, error, count } = await query;
    if (error) return res.status(400).json({ error: error.message });

    const unreadCount = data.filter(n => !n.is_read).length;
    res.json({ notifications: data, total: count, unreadCount });
  } catch (err) { next(err); }
}

// PATCH /api/notifications/:id/read
async function markAsRead(req, res, next) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Notification marked as read' });
  } catch (err) { next(err); }
}

// PATCH /api/notifications/read-all
async function markAllAsRead(req, res, next) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.userId)
      .eq('is_read', false);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { next(err); }
}

// DELETE /api/notifications/:id
async function deleteNotification(req, res, next) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Notification deleted' });
  } catch (err) { next(err); }
}

// DELETE /api/notifications/clear-all
async function clearAll(req, res, next) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', req.userId);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'All notifications cleared' });
  } catch (err) { next(err); }
}

// POST /api/notifications (admin/counselor broadcast)
async function sendNotification(req, res, next) {
  try {
    const { user_id, title, message, type } = req.body;

    const { data, error } = await supabase
      .from('notifications')
      .insert({ user_id, title, message, type })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ notification: data });
  } catch (err) { next(err); }
}

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification, clearAll, sendNotification };