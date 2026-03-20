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
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
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
        email:    form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (authError) { setError(authError.message || 'Invalid email or password'); setLoading(false); return; }
      if (!data?.user) { setError('Login failed. Please try again.'); setLoading(false); return; }

      // Fetch role with 4s timeout — uses role_id fallback so counselors aren't misrouted
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
      } catch {
        console.warn('[Login] Profile fetch timed out — defaulting to student');
      }

      navigate(`/${roleName}`, { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', boxSizing: 'border-box',
    background: 'var(--bg3)', border: '1.5px solid var(--border)',
    borderRadius: 10, color: 'var(--text)', fontSize: 14, outline: 'none',
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 500, height: 500, background: 'rgba(79,142,247,0.07)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 450, height: 450, background: 'rgba(124,92,191,0.06)', borderRadius: '50%', filter: 'blur(80px)' }} />
      </div>

      <div style={{
        width: '100%', maxWidth: 420, position: 'relative', zIndex: 1,
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, background: 'linear-gradient(135deg,#4f8ef7,#7c5cbf)',
            borderRadius: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, marginBottom: 16, boxShadow: '0 10px 32px rgba(79,142,247,0.35)',
          }}>🧠</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 6 }}>MindCare</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Your mental wellness companion</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 18, padding: '32px 36px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}>
          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.4)',
              borderRadius: 10, padding: '11px 14px', marginBottom: 18,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span style={{ color: '#f87171', fontSize: 13, flex: 1 }}>{error}</span>
              <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer', fontSize: 18, padding: 0 }}>×</button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@university.edu" required disabled={loading} style={inputStyle} autoComplete="email" />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Enter your password" required disabled={loading} style={inputStyle} autoComplete="current-password" />
            </div>

            <button type="submit" disabled={loading || !form.email || !form.password}
              style={{
                width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                background: loading ? 'var(--surface)' : 'linear-gradient(135deg,#4f8ef7,#7c5cbf)',
                color: loading ? 'var(--text3)' : '#fff',
                cursor: loading || !form.email || !form.password ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
                boxShadow: loading ? 'none' : '0 4px 16px rgba(79,142,247,0.35)',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Signing in...
                </>
              ) : 'Sign In →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text3)' }}>
            New to MindCare?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Create an account</Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <Link to="/admin-login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 30,
            padding: '8px 18px', fontSize: 12, color: 'var(--text3)', textDecoration: 'none',
            transition: 'all 0.15s',
          }}>⚙️ Switch to Admin Portal</Link>
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}