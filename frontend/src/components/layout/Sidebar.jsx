import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

const studentNav = [
  { to: '/student',                  label: 'Dashboard',          icon: '🏠', end: true },
  { to: '/student/mood',             label: 'Mood Tracker',       icon: '😊' },
  { to: '/student/survey',           label: 'Mental Health Survey', icon: '📋' },
  { to: '/student/sleep',            label: 'Sleep Tracker',      icon: '🌙' },
  { to: '/student/lifestyle',        label: 'Lifestyle',          icon: '🏃' },
  { to: '/student/journal',          label: 'Journal',            icon: '📔' },
  { to: '/student/goals',            label: 'Goals',              icon: '🎯' },
  { to: '/student/recommendations',  label: 'AI Recommendations', icon: '🤖' },
  { to: '/student/chatbot',          label: 'AI Chatbot',         icon: '💬' },
  { to: '/student/appointments',     label: 'Appointments',       icon: '📅' },
  { to: '/student/forum',            label: 'Peer Forum',         icon: '👥' },
  { to: '/student/stress-relief',    label: 'Stress Relief',      icon: '🎮' },
  { to: '/student/report',           label: 'Weekly Report',      icon: '📊' },
];

const counselorNav = [
  { to: '/counselor',                label: 'Dashboard',          icon: '🏠', end: true },
  { to: '/counselor/students',       label: 'Students',           icon: '👥' },
  { to: '/counselor/alerts',         label: 'Crisis Alerts',      icon: '🚨' },
  { to: '/counselor/appointments',   label: 'Appointments',       icon: '📅' },
  { to: '/counselor/stress',         label: 'Stress Reports',     icon: '📈' },
];

const adminNav = [
  { to: '/admin',             label: 'Dashboard',     icon: '🏠', end: true },
  { to: '/admin/users',       label: 'Manage Users',  icon: '👥' },
  { to: '/admin/analytics',   label: 'Analytics',     icon: '📊' },
  { to: '/admin/alerts',      label: 'Crisis Alerts', icon: '🚨' },
  { to: '/admin/export',      label: 'Export Reports', icon: '📤' },
  { to: '/admin/backup',      label: 'Backup',        icon: '💾' },
  { to: '/admin/monitoring',  label: 'System Monitor', icon: '🖥️' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { profile, role } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navItems = role === 'admin' ? adminNav : role === 'counselor' ? counselorNav : studentNav;

  const initials = profile?.full_name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const roleColor = role === 'admin' ? '#f97316' : role === 'counselor' ? '#34d399' : 'var(--primary)';

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      // Clear any cached tokens
      try {
        Object.keys(localStorage).filter(k => k.startsWith('sb-')).forEach(k => localStorage.removeItem(k));
      } catch {}
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      // Force navigate anyway
      navigate('/login', { replace: true });
    }
  }

  return (
    <>
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
        {/* Logo + toggle */}
        <div style={{
          padding: '16px 12px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 8,
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🧠</div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', lineHeight: 1.2 }}>MindCare</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'capitalize' }}>{role} Portal</div>
              </div>
            </div>
          )}
          {collapsed && <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🧠</div>}
          <button onClick={onToggle}
            style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16, padding: 4, borderRadius: 6, flexShrink: 0 }}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Profile card — visible when expanded */}
        {!collapsed && (
          <div style={{
            margin: '12px 8px',
            padding: '12px 14px',
            background: 'var(--bg3)',
            borderRadius: 12,
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: `linear-gradient(135deg, ${roleColor}, ${roleColor}aa)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
                border: `2px solid ${roleColor}40`,
              }}>
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.full_name || 'User'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.email}
                </div>
                <div style={{
                  display: 'inline-block', marginTop: 3,
                  fontSize: 10, fontWeight: 600,
                  color: roleColor,
                  background: `${roleColor}15`,
                  padding: '1px 8px', borderRadius: 20,
                  textTransform: 'capitalize',
                }}>
                  {role}
                </div>
              </div>
            </div>

            {/* Profile & Settings shortcuts */}
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <button onClick={() => navigate(`/${role}/profile`)}
                style={{
                  flex: 1, padding: '6px 0', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--bg2)',
                  color: 'var(--text2)', cursor: 'pointer', fontSize: 11, fontWeight: 500,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                👤 Profile
              </button>
              <button onClick={() => navigate(`/${role}/notifications`)}
                style={{
                  flex: 1, padding: '6px 0', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--bg2)',
                  color: 'var(--text2)', cursor: 'pointer', fontSize: 11, fontWeight: 500,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                🔔 Alerts
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px 0' : '9px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 8, marginBottom: 2,
                color: isActive ? 'var(--primary)' : 'var(--text2)',
                background: isActive ? 'var(--primary-glow)' : 'transparent',
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                textDecoration: 'none', transition: 'all 0.15s', whiteSpace: 'nowrap',
              })}
              title={collapsed ? item.label : undefined}
            >
              <span style={{ fontSize: 16, flexShrink: 0, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout button */}
        <div style={{ padding: '8px', borderTop: '1px solid var(--border)' }}>
          {!collapsed && profile && (
            <div style={{ padding: '8px 10px', marginBottom: 4, fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Signed in as <strong style={{ color: 'var(--text2)' }}>{profile.full_name?.split(' ')[0]}</strong>
            </div>
          )}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={loggingOut}
            title={collapsed ? 'Logout' : undefined}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 10, padding: collapsed ? '10px 0' : '10px 10px',
              borderRadius: 8, background: 'none', border: 'none',
              color: 'var(--danger)', fontSize: 13, cursor: loggingOut ? 'wait' : 'pointer',
              transition: 'background 0.15s', fontWeight: 500,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <span style={{ width: 20, textAlign: 'center', fontSize: 16 }}>🚪</span>
            {!collapsed && (loggingOut ? 'Signing out...' : 'Sign Out')}
          </button>
        </div>
      </aside>

      {/* Logout confirmation dialog */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        }}
          onClick={() => setShowConfirm(false)}
        >
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 28, maxWidth: 360, width: '90%',
            textAlign: 'center',
          }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>Sign Out?</h3>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24 }}>
              Are you sure you want to sign out of MindCare?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10,
                  border: '1px solid var(--border)', background: 'var(--bg2)',
                  color: 'var(--text)', cursor: 'pointer', fontWeight: 500, fontSize: 14,
                }}>
                Cancel
              </button>
              <button
                onClick={() => { setShowConfirm(false); handleLogout(); }}
                disabled={loggingOut}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10,
                  border: 'none', background: 'var(--danger)',
                  color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14,
                }}>
                {loggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}