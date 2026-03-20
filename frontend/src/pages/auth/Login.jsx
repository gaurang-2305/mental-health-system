import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';

function deriveRoleFromProfile(p) {
  if (!p) return 'student';
  if (p.roles?.name) return p.roles.name;
  if (p.role_id === 3) return 'admin';
  if (p.role_id === 2) return 'counselor';
  return 'student';
}

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => setVisible(true), 60); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      if (authError) { setError(authError.message || 'Invalid email or password'); setLoading(false); return; }
      if (!data?.user) { setError('Login failed. Please try again.'); setLoading(false); return; }

      let roleName = 'student';
      try {
        const profilePromise = supabase
          .from('user_profiles')
          .select('role_id, roles(name)')
          .eq('id', data.user.id)
          .single();
        const { data: profile } = await Promise.race([
          profilePromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
        ]);
        roleName = deriveRoleFromProfile(profile);
      } catch { /* default student */ }

      navigate(`/${roleName}`, { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(150deg, #f7f0e6 0%, #ede5d8 50%, #f2ece0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Outfit', sans-serif",
    }}>

      {/* Decorative blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-8%', right: '-6%', width: 420, height: 420, background: 'rgba(160,120,80,0.09)', borderRadius: '50%', filter: 'blur(70px)' }} />
        <div style={{ position: 'absolute', bottom: '-6%', left: '-4%', width: 360, height: 360, background: 'rgba(140,100,60,0.07)', borderRadius: '50%', filter: 'blur(70px)' }} />
        <div style={{ position: 'absolute', top: '45%', left: '40%', width: 300, height: 300, background: 'rgba(180,150,100,0.05)', borderRadius: '50%', filter: 'blur(80px)' }} />
      </div>

      <div style={{
        width: '100%',
        maxWidth: 440,
        position: 'relative',
        zIndex: 1,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60,
            background: 'linear-gradient(135deg, #3a2a18, #5c4230)',
            borderRadius: 18,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, marginBottom: 18,
            boxShadow: '0 12px 36px rgba(60,42,24,0.28)',
            border: '1px solid rgba(200,160,110,0.2)',
          }}>✦</div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '2.2rem',
            fontWeight: 600,
            color: '#2c1f12',
            marginBottom: 6,
            letterSpacing: '0.02em',
          }}>
            MindCare
          </h1>
          <p style={{ color: '#a8896e', fontSize: 13.5, fontFamily: "'Outfit', sans-serif" }}>
            Your mental wellness companion
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,252,248,0.92)',
          border: '1px solid rgba(160,120,80,0.18)',
          borderRadius: 20,
          padding: '36px 40px',
          boxShadow: '0 8px 40px rgba(80,50,20,0.12), 0 1px 0 rgba(255,255,255,0.8) inset',
          backdropFilter: 'blur(16px)',
        }}>

          {/* Eyebrow */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 26, paddingBottom: 20,
            borderBottom: '1px solid rgba(160,120,80,0.12)',
          }}>
            <div style={{ width: 28, height: 1, background: 'rgba(160,120,80,0.35)' }} />
            <span style={{ fontSize: 10, color: '#a8896e', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
              Sign In
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(160,120,80,0.35)' }} />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(184,74,74,0.08)',
              border: '1px solid rgba(184,74,74,0.28)',
              borderRadius: 10, padding: '11px 14px',
              marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 9,
              animation: 'fadeIn 0.2s ease',
            }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>!</span>
              <span style={{ color: '#b84a4a', fontSize: 13, flex: 1 }}>{error}</span>
              <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'rgba(184,74,74,0.5)', cursor: 'pointer', fontSize: 18, padding: 0, lineHeight: 1 }}>×</button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: '#7a5c44', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@university.edu"
                required
                disabled={loading}
                autoComplete="email"
                style={{ background: '#fdf8f2', borderColor: 'rgba(160,120,80,0.25)' }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: '#7a5c44', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Enter your password"
                required
                disabled={loading}
                autoComplete="current-password"
                style={{ background: '#fdf8f2', borderColor: 'rgba(160,120,80,0.25)' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !form.email || !form.password}
              style={{
                width: '100%', padding: '13px',
                borderRadius: 12, border: 'none',
                background: loading
                  ? 'rgba(160,120,80,0.4)'
                  : 'linear-gradient(135deg, #3a2a18, #6b4e30)',
                color: '#f5ede0',
                cursor: loading || !form.email || !form.password ? 'not-allowed' : 'pointer',
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: '0.08em',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(58,42,24,0.32)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(245,237,224,0.3)', borderTopColor: '#f5ede0', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div style={{
            textAlign: 'center', marginTop: 22,
            fontSize: 13, color: '#a8896e',
          }}>
            New to MindCare?{' '}
            <Link to="/register" style={{ color: '#a07850', fontWeight: 600, textDecoration: 'none' }}>
              Create an account
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/admin-login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,252,248,0.7)',
            border: '1px solid rgba(160,120,80,0.2)',
            borderRadius: 30,
            padding: '8px 20px',
            fontSize: 12, color: '#a8896e',
            textDecoration: 'none',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(160,120,80,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(160,120,80,0.2)'; }}
          >
            ⚙ Admin Portal
          </Link>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20 }}>
          {['Encrypted', 'Confidential', 'Secure'].map(t => (
            <span key={t} style={{ fontSize: 11, color: '#c4a882', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, background: '#c4a882', borderRadius: '50%', display: 'inline-block' }} />
              {t}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0) } to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );
}