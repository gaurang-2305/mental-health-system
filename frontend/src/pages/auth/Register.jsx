import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';
import { Button, Input, Alert, Select } from '../../components/ui/index.jsx';

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '', age: '', class: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    setError(''); setLoading(true);
    try {
      await registerUser(form.email, form.password, { full_name: form.full_name, age: Number(form.age), class: form.class, phone: form.phone });
      navigate('/login?registered=1');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '15%', right: '15%', width: 400, height: 400, background: 'rgba(79,142,247,0.05)', borderRadius: '50%', filter: 'blur(80px)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 480, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: 'var(--primary)', borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 14 }}>🧠</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: 4 }}>Create your account</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Join MindCare for mental wellness support</p>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
          <Alert message={error} type="error" onClose={() => setError('')} />
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Full Name" type="text" placeholder="Your full name" value={form.full_name} onChange={set('full_name')} required />
            <Input label="Email" type="email" placeholder="you@university.edu" value={form.email} onChange={set('email')} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Age" type="number" placeholder="21" min="16" max="35" value={form.age} onChange={set('age')} />
              <Input label="Class / Year" type="text" placeholder="e.g. SY B.Tech" value={form.class} onChange={set('class')} />
            </div>
            <Input label="Phone (optional)" type="tel" placeholder="+91 9876543210" value={form.phone} onChange={set('phone')} />
            <Input label="Password" type="password" placeholder="Min 8 characters" value={form.password} onChange={set('password')} required />
            <Input label="Confirm Password" type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
            <Button type="submit" loading={loading} style={{ marginTop: 6 }}>Create Account →</Button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: 'var(--text3)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}