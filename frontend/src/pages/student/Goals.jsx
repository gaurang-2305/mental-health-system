import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createGoal, getGoals, updateGoal } from '../../services/dataService';
import { Button, Card, Loader, Input, Modal, Badge } from '../../components/ui/index.jsx';

export default function Goals() {
  const { profile } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', target_date: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.id) getGoals(profile.id).then(d => { setGoals(d); setLoading(false); }).catch(() => setLoading(false));
  }, [profile?.id]);

  async function handleCreate() {
    setSaving(true);
    try {
      const g = await createGoal(profile.id, form.title, form.description, form.target_date || null);
      setGoals([g, ...goals]);
      setShowModal(false); setForm({ title: '', description: '', target_date: '' });
    } finally { setSaving(false); }
  }

  async function toggleGoal(goal) {
    const updated = await updateGoal(goal.id, { is_completed: !goal.is_completed });
    setGoals(goals.map(g => g.id === goal.id ? updated : g));
  }

  const active = goals.filter(g => !g.is_completed);
  const completed = goals.filter(g => g.is_completed);
  const completionRate = goals.length ? Math.round((completed.length / goals.length) * 100) : 0;

  if (loading) return <Loader />;

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1>🎯 Goals</h1>
          <p>Set and track your mental wellness goals.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ New Goal</Button>
      </div>

      {/* Progress */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[{ label: 'Active Goals', value: active.length, icon: '⭕', color: 'var(--primary)' },
          { label: 'Completed', value: completed.length, icon: '✅', color: 'var(--success)' },
          { label: 'Completion Rate', value: `${completionRate}%`, icon: '📊', color: 'var(--warning)' }].map(s => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, display: 'flex', gap: 14, alignItems: 'center' }}>
            <span style={{ fontSize: 28 }}>{s.icon}</span>
            <div><div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.label}</div></div>
          </div>
        ))}
      </div>

      {goals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <h3 style={{ color: 'var(--text2)', marginBottom: 8 }}>No goals yet</h3>
          <p style={{ marginBottom: 20 }}>Set your first mental wellness goal to track your progress</p>
          <Button onClick={() => setShowModal(true)}>Create First Goal</Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Card title="Active Goals">
            {active.length === 0 ? <div style={{ color: 'var(--text3)', fontSize: 13, padding: '10px 0' }}>All goals completed! 🎉</div> : (
              active.map(g => (
                <div key={g.id} style={{ display: 'flex', gap: 10, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <button onClick={() => toggleGoal(g)} style={{ background: 'none', fontSize: 20, cursor: 'pointer', flexShrink: 0, padding: 0 }}>⭕</button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{g.title}</div>
                    {g.description && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{g.description}</div>}
                    {g.target_date && <div style={{ fontSize: 11, color: 'var(--primary)', marginTop: 4 }}>📅 {new Date(g.target_date).toLocaleDateString()}</div>}
                  </div>
                </div>
              ))
            )}
          </Card>
          <Card title="Completed Goals">
            {completed.length === 0 ? <div style={{ color: 'var(--text3)', fontSize: 13, padding: '10px 0' }}>Complete your first goal!</div> : (
              completed.map(g => (
                <div key={g.id} style={{ display: 'flex', gap: 10, padding: '12px 0', borderBottom: '1px solid var(--border)', opacity: 0.7 }}>
                  <button onClick={() => toggleGoal(g)} style={{ background: 'none', fontSize: 20, cursor: 'pointer', flexShrink: 0, padding: 0 }}>✅</button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, textDecoration: 'line-through', color: 'var(--text2)' }}>{g.title}</div>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Wellness Goal"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleCreate} loading={saving} disabled={!form.title}>Create Goal</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Goal Title" placeholder="e.g. Meditate 10 mins daily" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Why is this goal important to you?" rows={3} />
          </div>
          <Input label="Target Date (optional)" type="date" value={form.target_date} onChange={e => setForm({ ...form, target_date: e.target.value })} min={new Date().toISOString().split('T')[0]} />
        </div>
      </Modal>
    </div>
  );
}