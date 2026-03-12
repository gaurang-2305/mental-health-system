import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/authService';
import { Button, Card, Input, Alert } from '../../components/ui/index.jsx';

export default function Profile() {
  const { profile, setProfile } = useAuth();
  const [form, setForm] = useState({ full_name: profile?.full_name || '', age: profile?.age || '', class: profile?.class || '', phone: profile?.phone || '', language_pref: profile?.language_pref || 'en' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const updated = await updateProfile(profile.id, { full_name: form.full_name, age: Number(form.age), class: form.class, phone: form.phone, language_pref: form.language_pref });
      setProfile({ ...profile, ...updated });
      setSuccess(true); setTimeout(() => setSuccess(false), 3000);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="animate-fade" style={{ maxWidth: 600 }}>
      <div className="page-header"><h1>👤 My Profile</h1><p>Manage your account information and preferences.</p></div>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 4 }}>{profile?.full_name}</h2>
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>{profile?.email}</div>
            <div style={{ display: 'inline-block', background: 'var(--primary-glow)', color: 'var(--primary)', fontSize: 12, padding: '2px 10px', borderRadius: 20, marginTop: 6, fontWeight: 500, textTransform: 'capitalize' }}>{profile?.roles?.name || 'Student'}</div>
          </div>
        </div>

        <Alert message={success ? 'Profile updated successfully!' : ''} type="success" />
        <Alert message={error} type="error" onClose={() => setError('')} />

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Full Name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Age" type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} min={16} max={35} />
            <Input label="Class / Year" value={form.class} onChange={e => setForm({ ...form, class: e.target.value })} placeholder="e.g. SY B.Tech" />
          </div>
          <Input label="Phone" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <div className="form-group">
            <label className="form-label">Language Preference</label>
            <select value={form.language_pref} onChange={e => setForm({ ...form, language_pref: e.target.value })}>
              <option value="en">English</option>
              <option value="hi">Hindi (हिंदी)</option>
              <option value="gu">Gujarati (ગુજરાતી)</option>
              <option value="mr">Marathi (मराठी)</option>
            </select>
          </div>
          <div style={{ paddingTop: 6 }}>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>Email: {profile?.email} (cannot be changed)</div>
          </div>
          <Button type="submit" loading={saving} style={{ alignSelf: 'flex-start', minWidth: 140 }}>Save Changes</Button>
        </form>
      </Card>

      <Card title="Account Info">
        <div style={{ display: 'grid', gap: 10 }}>
          {[
            { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
            { label: 'Account Type', value: profile?.roles?.name || 'Student' },
            { label: 'User ID', value: profile?.id?.slice(0, 8) + '...' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text3)' }}>{label}</span><span>{value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}