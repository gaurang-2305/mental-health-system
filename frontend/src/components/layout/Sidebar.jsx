import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

const studentNav = [
  { to: '/student',                  label: 'Dashboard',          icon: '◈', end: true },
  { to: '/student/mood',             label: 'Mood Tracker',       icon: '◎' },
  { to: '/student/survey',           label: 'Mental Health Survey', icon: '✦' },
  { to: '/student/sleep',            label: 'Sleep Tracker',      icon: '◐' },
  { to: '/student/lifestyle',        label: 'Lifestyle',          icon: '◉' },
  { to: '/student/journal',          label: 'Journal',            icon: '❋' },
  { to: '/student/goals',            label: 'Goals',              icon: '◇' },
  { to: '/student/recommendations',  label: 'AI Recommendations', icon: '✧' },
  { to: '/student/chatbot',          label: 'AI Chatbot',         icon: '◈' },
  { to: '/student/appointments',     label: 'Appointments',       icon: '◻' },
  { to: '/student/forum',            label: 'Peer Forum',         icon: '◯' },
  { to: '/student/stress-relief',    label: 'Stress Relief',      icon: '❁' },
  { to: '/student/report',           label: 'Weekly Report',      icon: '◈' },
];

const counselorNav = [
  { to: '/counselor',               label: 'Dashboard',      icon: '◈', end: true },
  { to: '/counselor/students',      label: 'Students',       icon: '◯' },
  { to: '/counselor/alerts',        label: 'Crisis Alerts',  icon: '◉' },
  { to: '/counselor/appointments',  label: 'Appointments',   icon: '◻' },
  { to: '/counselor/stress',        label: 'Stress Reports', icon: '◎' },
];

const adminNav = [
  { to: '/admin',            label: 'Dashboard',     icon: '◈', end: true },
  { to: '/admin/users',      label: 'Manage Users',  icon: '◯' },
  { to: '/admin/analytics',  label: 'Analytics',     icon: '◎' },
  { to: '/admin/alerts',     label: 'Crisis Alerts', icon: '◉' },
  { to: '/admin/export',     label: 'Export Reports', icon: '◇' },
  { to: '/admin/backup',     label: 'Backup',        icon: '◻' },
  { to: '/admin/monitoring', label: 'System Monitor', icon: '✦' },
];

const roleAccent = {
  admin:     '#b84a2a',
  counselor: '#5a8a65',
  student:   '#a07850',
};

export default function Sidebar({ collapsed, onToggle }) {
  const { profile, role } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  const navItems = role === 'admin' ? adminNav : role === 'counselor' ? counselorNav : studentNav;
  const accent   = roleAccent[role] || '#a07850';

  const initials = profile?.full_name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      try { Object.keys(localStorage).filter(k => k.startsWith('sb-')).forEach(k => localStorage.removeItem(k)); } catch {}
      navigate('/login', { replace: true });
    } catch {
      navigate('/login', { replace: true });
    }
  }

  const sidebarStyle = {
    width: collapsed ? 60 : 248,
    minHeight: '100vh',
    background: '#2c1f12',
    backgroundImage: 'linear-gradient(170deg, #3a2a18 0%, #2c1f12 60%, #221608 100%)',
    borderRight: '1px solid rgba(160,120,80,0.18)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.26s cubic-bezier(0.4,0,0.2,1)',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflow: 'hidden',
    boxShadow: '4px 0 20px rgba(44,31,18,0.22)',
  };

  return (
    <>
      <aside style={sidebarStyle}>

        {/* ─── Logo + toggle ─── */}
        <div style={{
          padding: collapsed ? '18px 0' : '18px 16px',
          borderBottom: '1px solid rgba(160,120,80,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 10,
          flexShrink: 0,
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34,
                background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, flexShrink: 0,
                boxShadow: `0 4px 12px ${accent}44`,
              }}>
                ✦
              </div>
              <div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#f5ede0',
                  letterSpacing: '0.02em',
                  lineHeight: 1.1,
                }}>
                  MindCare
                </div>
                <div style={{
                  fontSize: 10,
                  color: 'rgba(200,170,130,0.6)',
                  textTransform: 'capitalize',
                  letterSpacing: '1px',
                  fontFamily: "'Outfit', sans-serif",
                }}>
                  {role} portal
                </div>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 32, height: 32,
              background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
              borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>✦</div>
          )}
          <button
            onClick={onToggle}
            style={{
              background: 'rgba(200,170,130,0.08)',
              border: '1px solid rgba(200,170,130,0.15)',
              borderRadius: 7,
              color: 'rgba(200,170,130,0.7)',
              cursor: 'pointer',
              fontSize: 12,
              padding: '4px 6px',
              flexShrink: 0,
              fontFamily: "'Outfit', sans-serif",
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,170,130,0.16)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,170,130,0.08)'; }}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* ─── Profile card ─── */}
        {!collapsed && (
          <div style={{
            margin: '12px 10px',
            padding: '12px 13px',
            background: 'rgba(200,160,110,0.08)',
            borderRadius: 12,
            border: '1px solid rgba(200,160,110,0.16)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38, height: 38,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#fff',
                flexShrink: 0,
                fontFamily: "'Outfit', sans-serif",
                boxShadow: `0 3px 8px ${accent}44`,
                border: '2px solid rgba(255,255,255,0.15)',
              }}>
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600,
                  color: '#f5ede0',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  fontFamily: "'Outfit', sans-serif",
                }}>
                  {profile?.full_name || 'User'}
                </div>
                <div style={{
                  fontSize: 10.5, color: 'rgba(200,170,130,0.55)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  fontFamily: "'Outfit', sans-serif",
                }}>
                  {profile?.email}
                </div>
                <div style={{
                  display: 'inline-block', marginTop: 4,
                  fontSize: 9.5, fontWeight: 600,
                  color: accent,
                  background: `${accent}20`,
                  padding: '1px 7px', borderRadius: 10,
                  textTransform: 'capitalize',
                  letterSpacing: '0.5px',
                  fontFamily: "'Outfit', sans-serif",
                  border: `1px solid ${accent}35`,
                }}>
                  {role}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              {[
                { label: 'Profile', path: `/${role}/profile` },
                { label: 'Alerts',  path: `/${role}/notifications` },
              ].map(btn => (
                <button
                  key={btn.label}
                  onClick={() => navigate(btn.path)}
                  style={{
                    flex: 1, padding: '5px 0', borderRadius: 7,
                    border: '1px solid rgba(200,160,110,0.2)',
                    background: 'transparent',
                    color: 'rgba(200,170,130,0.7)',
                    cursor: 'pointer',
                    fontSize: 10.5, fontWeight: 500,
                    fontFamily: "'Outfit', sans-serif",
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,160,110,0.2)'; e.currentTarget.style.color = 'rgba(200,170,130,0.7)'; }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Nav section label ─── */}
        {!collapsed && (
          <div style={{
            padding: '4px 18px 6px',
            fontSize: 9,
            fontWeight: 700,
            color: 'rgba(200,160,110,0.38)',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontFamily: "'Outfit', sans-serif",
            flexShrink: 0,
          }}>
            Navigation
          </div>
        )}

        {/* ─── Navigation ─── */}
        <nav style={{ flex: 1, padding: '4px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={collapsed ? item.label : undefined}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '9px 0' : '8px 11px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 9,
                marginBottom: 2,
                color: isActive ? accent : 'rgba(200,170,130,0.55)',
                background: isActive
                  ? `${accent}15`
                  : 'transparent',
                borderLeft: isActive ? `2px solid ${accent}` : '2px solid transparent',
                fontSize: 12.5,
                fontWeight: isActive ? 600 : 400,
                textDecoration: 'none',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: '0.2px',
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.color = 'rgba(200,170,130,0.85)';
                  e.currentTarget.style.background = 'rgba(200,160,110,0.07)';
                }
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.color = 'rgba(200,170,130,0.55)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{
                fontSize: 14, flexShrink: 0, width: 20,
                textAlign: 'center', lineHeight: 1,
                fontFamily: 'system-ui',
              }}>
                {item.icon}
              </span>
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        {/* ─── Logout ─── */}
        <div style={{
          padding: '10px 8px',
          borderTop: '1px solid rgba(160,120,80,0.15)',
          flexShrink: 0,
        }}>
          {!collapsed && profile && (
            <div style={{
              padding: '6px 11px',
              marginBottom: 4,
              fontSize: 10.5,
              color: 'rgba(200,160,110,0.35)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              fontFamily: "'Outfit', sans-serif",
            }}>
              Signed in as <span style={{ color: 'rgba(200,170,130,0.55)', fontWeight: 600 }}>
                {profile.full_name?.split(' ')[0]}
              </span>
            </div>
          )}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={loggingOut}
            title={collapsed ? 'Sign Out' : undefined}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 10,
              padding: collapsed ? '9px 0' : '9px 11px',
              borderRadius: 9,
              background: 'none',
              border: 'none',
              color: 'rgba(220,100,80,0.55)',
              fontSize: 12.5,
              cursor: loggingOut ? 'wait' : 'pointer',
              transition: 'all 0.15s',
              fontWeight: 500,
              fontFamily: "'Outfit', sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,100,80,0.08)'; e.currentTarget.style.color = 'rgba(220,100,80,0.85)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(220,100,80,0.55)'; }}
          >
            <span style={{ fontSize: 14, width: 20, textAlign: 'center', fontFamily: 'system-ui' }}>⬡</span>
            {!collapsed && (loggingOut ? 'Signing out…' : 'Sign Out')}
          </button>
        </div>
      </aside>

      {/* ─── Confirm Dialog ─── */}
      {showConfirm && (
        <div
          onClick={() => setShowConfirm(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(44,31,18,0.55)',
            backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border2)',
              borderRadius: 18,
              padding: '32px 36px',
              maxWidth: 360,
              width: '90%',
              textAlign: 'center',
              boxShadow: 'var(--shadow-xl)',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '2.4rem', marginBottom: 12,
              color: 'var(--text)',
            }}>
              ◎
            </div>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.4rem', marginBottom: 8, color: 'var(--text)',
            }}>
              Sign Out?
            </h3>
            <p style={{ color: 'var(--text3)', fontSize: 13.5, marginBottom: 26 }}>
              Are you sure you want to sign out of MindCare?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1, padding: '11px',
                  borderRadius: 10,
                  border: '1.5px solid var(--border2)',
                  background: 'var(--bg3)',
                  color: 'var(--text2)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: 13.5,
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowConfirm(false); handleLogout(); }}
                disabled={loggingOut}
                style={{
                  flex: 1, padding: '11px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'var(--danger)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13.5,
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {loggingOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </>
  );
}