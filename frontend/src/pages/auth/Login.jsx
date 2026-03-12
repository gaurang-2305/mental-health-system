import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import { Button, Input, Alert } from '../../components/ui/index.jsx';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { user } = await loginUser(form.email, form.password);
      if (!user) throw new Error('Login failed');
      const { data: profile } = await import('../../services/supabaseClient').then(m =>
        m.supabase.from('user_profiles').select('*, roles(name)').eq('id', user.id).single()
      );
      const role = profile?.roles?.name || 'student';
      navigate(`/${role}`);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {/* Background decoration */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 400, height: 400, background: 'rgba(79,142,247,0.06)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 300, height: 300, background: 'rgba(52,211,153,0.05)', borderRadius: '50%', filter: 'blur(60px)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: 'var(--primary)', borderRadius: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 16 }}>🧠</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Sign in to MindCare to continue</p>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
          <Alert message={error} type="error" onClose={() => setError('')} />
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Email address" type="email" placeholder="you@university.edu" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
            <Input label="Password" type="password" placeholder="Enter your password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
            <Button type="submit" loading={loading} style={{ marginTop: 8 }}>Sign In →</Button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text3)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary)' }}>Register</Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text3)' }}>
          Admin? <Link to="/admin-login" style={{ color: 'var(--text2)' }}>Admin Login →</Link>
        </div>
      </div>
    </div>
  );
}