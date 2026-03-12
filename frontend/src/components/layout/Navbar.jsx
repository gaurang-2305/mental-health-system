import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markAllNotificationsRead } from '../../services/dataService';

export default function Navbar({ onToggleSidebar }) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      getNotifications(profile.id).then(setNotifications).catch(() => {});
    }
  }, [profile?.id]);

  const unread = notifications.filter(n => !n.is_read).length;

  async function handleMarkAllRead() {
    await markAllNotificationsRead(profile.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  return (
    <header style={{
      height: 60, background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', padding: '0 20px',
      gap: 16, position: 'sticky', top: 0, zIndex: 100,
    }}>
      <button onClick={onToggleSidebar} style={{ background: 'none', color: 'var(--text2)', fontSize: 18, padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>☰</button>

      <div style={{ flex: 1 }} />

      {/* Notifications */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => setShowNotifs(!showNotifs)}
          style={{ position: 'relative', background: 'none', color: 'var(--text2)', fontSize: 18, padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}>
          🔔
          {unread > 0 && (
            <span style={{ position: 'absolute', top: 2, right: 2, background: 'var(--danger)', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{unread > 9 ? '9+' : unread}</span>
          )}
        </button>

        {showNotifs && (
          <div onClick={e => e.stopPropagation()} style={{
            position: 'absolute', right: 0, top: '100%', marginTop: 8,
            width: 320, background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', zIndex: 200,
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: 14 }}>Notifications</strong>
              {unread > 0 && <button onClick={handleMarkAllRead} style={{ background: 'none', color: 'var(--primary)', fontSize: 12, cursor: 'pointer' }}>Mark all read</button>}
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No notifications</div>
              ) : notifications.slice(0, 10).map(n => (
                <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: n.is_read ? 'transparent' : 'rgba(79,142,247,0.05)', display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: n.is_read ? 400 : 600 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{n.message}</div>
                  </div>
                  {!n.is_read && <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%', marginTop: 4, flexShrink: 0 }} />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User avatar */}
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer' }}
        onClick={() => navigate('/student/profile')}>
        {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
      </div>
    </header>
  );
}