import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';

export default function Register() {
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirm: '',
    age: '', class: '', phone: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!form.full_name.trim())        return setError('Full name is required.');
    if (!form.email.trim())            return setError('Email is required.');
    if (form.password.length < 8)      return setError('Password must be at least 8 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');

    setLoading(true);
    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email:    form.email.trim().toLowerCase(),
        password: form.password,
        options:  { data: { full_name: form.full_name.trim() } },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!authData?.user) {
        setError('Registration failed — no user returned. Please try again.');
        setLoading(false);
        return;
      }

      // Step 2: Insert profile row
      // Uses 'class' (not 'class_year') to match the DB schema
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id:        authData.user.id,
          email:     form.email.trim().toLowerCase(),
          full_name: form.full_name.trim(),
          age:       form.age ? parseInt(form.age) : null,
          class:     form.class.trim() || null,
          phone:     form.phone.trim() || null,
          role_id:   1,   // student
        });

      if (profileError) {
        // Profile insert failed — log it but don't block the user
        // (the auth account is created; they can still log in)
        console.error('Profile insert error:', profileError.message);
      }

      setSuccess(true);
      // Auto-navigate to login after 2s
      setTimeout(() => navigate('/login?registered=1'), 2000);

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 10, color: 'var(--success)' }}>Account Created!</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20 }}>
          Welcome to MindCare! Redirecting you to login...
        </p>
        <div style={{
          width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: 'var(--primary)', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite', margin: '0 auto',
        }} />
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, background: 'rgba(79,142,247,0.06)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 350, height: 350, background: 'rgba(124,92,191,0.05)', borderRadius: '50%', filter: 'blur(80px)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 500, position: 'relative', zIndex: 1 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, background: 'linear-gradient(135deg,#4f8ef7,#7c5cbf)',
            borderRadius: 16, display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 28, marginBottom: 14,
            boxShadow: '0 8px 24px rgba(79,142,247,0.3)',
          }}>🧠</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: 6 }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Join MindCare for mental wellness support</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 18, padding: '32px 36px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}>

          {/* Error banner */}
          {error && (
            <div style={{
              background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.4)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 10,
              animation: 'fadeIn 0.2s ease',
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
              <span style={{ color: '#f87171', fontSize: 13, flex: 1 }}>{error}</span>
              <button onClick={() => setError('')}
                style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.6)', cursor: 'pointer', fontSize: 18, padding: 0, lineHeight: 1 }}>
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Full Name <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="text" value={form.full_name} onChange={set('full_name')}
                placeholder="Your full name" required
                style={{ width: '100%', padding: '11px 14px', boxSizing: 'border-box' }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Email <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="email" value={form.email} onChange={set('email')}
                placeholder="you@university.edu" required
                style={{ width: '100%', padding: '11px 14px', boxSizing: 'border-box' }}
              />
            </div>

            {/* Age + Class */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Age</label>
                <input
                  type="number" value={form.age} onChange={set('age')}
                  placeholder="21" min="15" max="35"
                  style={{ width: '100%', padding: '11px 14px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Class / Year</label>
                <input
                  type="text" value={form.class} onChange={set('class')}
                  placeholder="e.g. SY B.Tech"
                  style={{ width: '100%', padding: '11px 14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Phone */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Phone <span style={{ color: 'var(--text3)', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
              </label>
              <input
                type="tel" value={form.phone} onChange={set('phone')}
                placeholder="+91 9876543210"
                style={{ width: '100%', padding: '11px 14px', boxSizing: 'border-box' }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Password <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="password" value={form.password} onChange={set('password')}
                placeholder="Min 8 characters" required
                style={{ width: '100%', padding: '11px 14px', boxSizing: 'border-box' }}
              />
              {form.password.length > 0 && form.password.length < 8 && (
                <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 4 }}>⚠ Must be at least 8 characters</div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Confirm Password <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="password" value={form.confirm} onChange={set('confirm')}
                placeholder="Repeat password" required
                style={{
                  width: '100%', padding: '11px 14px', boxSizing: 'border-box',
                  borderColor: form.confirm && form.confirm !== form.password ? '#f87171' : undefined,
                }}
              />
              {form.confirm && form.confirm !== form.password && (
                <div style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>⚠ Passwords don't match</div>
              )}
              {form.confirm && form.confirm === form.password && form.confirm.length >= 8 && (
                <div style={{ fontSize: 11, color: '#34d399', marginTop: 4 }}>✓ Passwords match</div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                background: loading ? 'var(--surface)' : 'linear-gradient(135deg,#4f8ef7,#7c5cbf)',
                color: loading ? 'var(--text3)' : '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
                letterSpacing: '0.3px',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(79,142,247,0.35)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Creating account...
                </>
              ) : 'Create Account →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text3)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16 }}>
          {['🔒 Encrypted', '💙 Confidential', '✅ Secure'].map(t => (
            <span key={t} style={{ fontSize: 11, color: 'var(--text3)' }}>{t}</span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}