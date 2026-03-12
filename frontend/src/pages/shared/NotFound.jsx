import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, user } = useAuth();

  const homeRoute = !user
    ? '/login'
    : role === 'admin'
    ? '/admin'
    : role === 'counselor'
    ? '/counselor'
    : '/student';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: '24px',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '480px', width: '100%' }}>
        {/* Animated 404 */}
        <div
          style={{
            fontSize: '100px',
            lineHeight: 1,
            marginBottom: '8px',
            animation: 'pulse 3s ease-in-out infinite',
          }}
        >
          🔍
        </div>

        <h1
          style={{
            fontSize: '72px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--primary), #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 8px',
            lineHeight: 1,
          }}
        >
          404
        </h1>

        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 12px',
          }}
        >
          Page Not Found
        </h2>

        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}
        >
          The page{' '}
          <code
            style={{
              background: 'rgba(255,255,255,0.08)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '13px',
              color: 'var(--text-secondary)',
            }}
          >
            {location.pathname}
          </code>{' '}
          doesn't exist or has been moved. Don't worry — your mental health data is safe!
        </p>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '11px 24px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.07)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            ← Go Back
          </button>
          <button
            onClick={() => navigate(homeRoute)}
            style={{
              padding: '11px 24px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--primary)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            🏠 Go to Dashboard
          </button>
        </div>

        {/* Quick links */}
        {user && (
          <div style={{ marginTop: '40px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Quick links
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {(role === 'student'
                ? [
                    { path: '/student', label: '📊 Dashboard' },
                    { path: '/student/mood', label: '😊 Mood Tracker' },
                    { path: '/student/chatbot', label: '🤖 AI Chatbot' },
                    { path: '/student/appointments', label: '📅 Appointments' },
                  ]
                : role === 'counselor'
                ? [
                    { path: '/counselor', label: '📊 Dashboard' },
                    { path: '/counselor/alerts', label: '🚨 Alerts' },
                    { path: '/counselor/students', label: '👥 Students' },
                  ]
                : [
                    { path: '/admin', label: '📊 Dashboard' },
                    { path: '/admin/users', label: '👥 Users' },
                  ]
              ).map(({ path, label }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 500,
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Branding */}
        <div style={{ marginTop: '48px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(79,142,247,0.08)',
              borderRadius: '20px',
              border: '1px solid rgba(79,142,247,0.2)',
            }}
          >
            <span style={{ fontSize: '16px' }}>💙</span>
            <span style={{ fontSize: '13px', color: '#4f8ef7', fontWeight: 600 }}>MindCare</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;