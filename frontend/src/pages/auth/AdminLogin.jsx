import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';

export default function AdminLogin() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady]     = useState(false); // don't show form until session is cleared
  const navigate = useNavigate();

  // Always sign out any existing session when this page loads.
  // Admin must authenticate fresh every time — no auto-redirect.
  useEffect(() => {
    supabase.auth.signOut().finally(() => {
      try {
        Object.keys(localStorage)
          .filter(k => k.startsWith('sb-'))
          .forEach(k => localStorage.removeItem(k));
      } catch {}
      setReady(true);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email:    form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (authErr) { setError(authErr.message || 'Invalid credentials'); setLoading(false); return; }
      if (!data?.user) { setError('Login failed. Please try again.'); setLoading(false); return; }

      // Fetch profile — check role_id AND roles(name) join
      const { data: profile, error: profErr } = await supabase
        .from('user_profiles')
        .select('role_id, roles(name)')
        .eq('id', data.user.id)
        .single();

      if (profErr || !profile) {
        await supabase.auth.signOut();
        setError('Could not verify your account. Please contact support.');
        setLoading(false);
        return;
      }

      // Derive role — role_id fallback so join failures don't block admin
      const roleName = profile.roles?.name
        || (profile.role_id === 3 ? 'admin' : profile.role_id === 2 ? 'counselor' : 'student');

      if (roleName !== 'admin') {
        await supabase.auth.signOut();
        setError('Access denied — admin accounts only.');
        setLoading(false);
        return;
      }

      navigate('/admin', { replace: true });

    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px 12px 40px', boxSizing: 'border-box',
    background: '#fff', border: '1.5px solid #e8d5b0',
    borderRadius: 10, fontSize: 14, outline: 'none', color: '#2d1f0a',
  };

  // Show a minimal spinner while signing out the previous session
  if (!ready) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#fef9ec,#fdefc8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(180,83,9,0.2)', borderTopColor: '#f97316', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      <span style={{ color: '#78540c', fontSize: 13 }}>Preparing secure login...</span>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#fef9ec 0%,#fdefc8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'system-ui, sans-serif', position: 'relative',
    }}>
      {/* Back link */}
      <div style={{ position: 'absolute', top: 24, left: 24 }}>
        <Link to="/login" style={{ fontSize: 13, color: '#b5651d', textDecoration: 'none' }}>
          ← Back to Student / Counselor Login
        </Link>
      </div>

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, background: 'linear-gradient(135deg,#f97316,#b45309)',
            borderRadius: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, marginBottom: 16, boxShadow: '0 10px 32px rgba(249,115,22,0.35)',
          }}>⚙️</div>
          <h1 style={{ fontFamily: 'serif', fontSize: '2rem', marginBottom: 6, color: '#1a0f00' }}>
            <span style={{ color: '#f97316' }}>Admin</span> Portal
          </h1>
          <p style={{ color: '#78540c', fontSize: 14 }}>MindCare system administration</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid #f0d9a0', borderRadius: 18, padding: '32px 36px', boxShadow: '0 8px 32px rgba(180,83,9,0.1)' }}>

          {/* Restricted notice */}
          <div style={{ background: '#fffbeb', border: '1px solid #f0d9a0', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#78540c' }}>
            🔒 Restricted access — authorized administrators only
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#fff5f5', border: '1px solid rgba(229,62,62,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>⚠️</span>
              <span style={{ color: '#c53030', fontSize: 13, flex: 1 }}>{error}</span>
              <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'rgba(197,48,48,0.5)', cursor: 'pointer', fontSize: 18, padding: 0 }}>×</button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#78540c', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Admin Email</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>✉️</span>
                <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  placeholder="admin@uni.edu" required disabled={loading} style={inputStyle} autoComplete="email" />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#78540c', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔒</span>
                <input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  placeholder="••••••••••••••" required disabled={loading}
                  style={{ ...inputStyle, borderColor: error ? '#e53e3e' : '#e8d5b0' }}
                  autoComplete="current-password" />
              </div>
            </div>

            <button type="submit" disabled={loading || !form.email || !form.password}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: loading ? '#d4a06a' : 'linear-gradient(135deg,#f97316,#b45309)',
                color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: 15, letterSpacing: '0.3px',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(180,83,9,0.35)',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Verifying...
                </>
              ) : 'Access Admin Panel →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <div style={{ height: 1, background: '#f0d9a0', marginBottom: 16, position: 'relative' }}>
              <span style={{ position: 'absolute', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', padding: '0 12px', fontSize: 10, color: '#b5651d', letterSpacing: '1px', fontWeight: 600 }}>RESTRICTED</span>
            </div>
            <span style={{ fontSize: 13, color: '#78540c' }}>Not an admin? </span>
            <Link to="/login" style={{ fontSize: 13, color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>Student / Counselor login</Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.8)', border: '1.5px solid #e8d5b0',
            borderRadius: 30, padding: '9px 20px', fontSize: 13, color: '#78540c', textDecoration: 'none',
          }}>
            💬 Switch to Student / Counselor Login
          </Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16 }}>
          {['Admin only', 'Audit logged', 'Secure'].map(t => (
            <span key={t} style={{ fontSize: 11, color: '#b5651d', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, background: '#f97316', borderRadius: '50%', display: 'inline-block' }} />
              {t}
            </span>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}