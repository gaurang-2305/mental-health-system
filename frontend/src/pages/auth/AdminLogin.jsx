import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import { Button, Input, Alert } from '../../components/ui/index.jsx';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { user } = await loginUser(form.email, form.password);
      const { data: profile } = await import('../../services/supabaseClient').then(m =>
        m.supabase.from('user_profiles').select('*, roles(name)').eq('id', user.id).single()
      );
      if (profile?.roles?.name !== 'admin') throw new Error('Access denied. Not an admin account.');
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: '#f59e0b', borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 14 }}>⚙️</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>Admin Portal</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>Restricted access — authorized personnel only</p>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
          <Alert message={error} type="error" onClose={() => setError('')} />
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Admin Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <Button type="submit" loading={loading} style={{ background: '#f59e0b', marginTop: 6 }}>Access Admin Panel →</Button>
          </form>
        </div>
      </div>
    </div>
  );
}