import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/authService';

const studentNav = [
  { to: '/student', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/student/mood', label: 'Mood Tracker', icon: '😊' },
  { to: '/student/survey', label: 'Mental Health Survey', icon: '📋' },
  { to: '/student/sleep', label: 'Sleep Tracker', icon: '🌙' },
  { to: '/student/lifestyle', label: 'Lifestyle', icon: '🏃' },
  { to: '/student/journal', label: 'Journal', icon: '📔' },
  { to: '/student/goals', label: 'Goals', icon: '🎯' },
  { to: '/student/recommendations', label: 'AI Recommendations', icon: '🤖' },
  { to: '/student/chatbot', label: 'AI Chatbot', icon: '💬' },
  { to: '/student/appointments', label: 'Appointments', icon: '📅' },
  { to: '/student/forum', label: 'Peer Forum', icon: '👥' },
  { to: '/student/stress-relief', label: 'Stress Relief', icon: '🎮' },
  { to: '/student/report', label: 'Weekly Report', icon: '📊' },
  { to: '/student/profile', label: 'Profile', icon: '👤' },
];

const counselorNav = [
  { to: '/counselor', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/counselor/students', label: 'Students', icon: '👥' },
  { to: '/counselor/alerts', label: 'Crisis Alerts', icon: '🚨' },
  { to: '/counselor/appointments', label: 'Appointments', icon: '📅' },
  { to: '/counselor/stress-reports', label: 'Stress Reports', icon: '📈' },
  { to: '/student/chatbot', label: 'AI Chatbot', icon: '💬' },
];

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/admin/users', label: 'Manage Users', icon: '👥' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📊' },
  { to: '/admin/alerts', label: 'Crisis Alerts', icon: '🚨' },
  { to: '/admin/export', label: 'Export Reports', icon: '📤' },
  { to: '/admin/backup', label: 'Backup & Recovery', icon: '💾' },
  { to: '/admin/monitoring', label: 'System Monitor', icon: '🖥️' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { profile, role } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = role === 'admin' ? adminNav : role === 'counselor' ? counselorNav : studentNav;

  async function handleLogout() {
    setLoggingOut(true);
    await logoutUser();
    navigate('/login');
  }

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <aside style={{
      width: collapsed ? 64 : 240,
      minHeight: '100vh',
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.25s ease',
      flexShrink: 0,
      position: 'sticky', top: 0, height: '100vh',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🧠</div>
        {!collapsed && <div><div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', whiteSpace: 'nowrap' }}>MindCare</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>Mental Health System</div></div>}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 8, marginBottom: 2,
              color: isActive ? 'var(--primary)' : 'var(--text2)',
              background: isActive ? 'var(--primary-glow)' : 'transparent',
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              textDecoration: 'none', transition: 'all 0.15s', whiteSpace: 'nowrap',
            })}>
            <span style={{ fontSize: 16, flexShrink: 0, width: 20, textAlign: 'center' }}>{item.icon}</span>
            {!collapsed && item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.full_name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'capitalize' }}>{role}</div>
            </div>
          </div>
        )}
        <button onClick={handleLogout} disabled={loggingOut}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, background: 'none', color: 'var(--danger)', fontSize: 13, cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-bg)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <span style={{ width: 20, textAlign: 'center' }}>🚪</span>
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}