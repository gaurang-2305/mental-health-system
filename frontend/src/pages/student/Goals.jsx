import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createGoal, getGoals, updateGoal } from '../../services/dataService';
import { Button, Card, Loader, Modal } from '../../components/ui/index.jsx';

export default function Goals() {
  const { profile } = useAuth();
  const [goals, setGoals]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ title: '', description: '', target_date: '' });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (profile?.id) {
      getGoals(profile.id)
        .then(d => { setGoals(d); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [profile?.id]);

  async function handleCreate() {
    if (!form.title.trim()) { setError('Please enter a goal title'); return; }
    setSaving(true);
    setError('');
    try {
      // FIX: pass object — createGoal(userId, { title, description, target_date })
      const g = await createGoal(profile.id, {
        title:       form.title.trim(),
        description: form.description.trim(),
        target_date: form.target_date || null,
      });
      setGoals(prev => [g, ...prev]);
      setShowModal(false);
      setForm({ title: '', description: '', target_date: '' });
    } catch (e) {
      setError(e.message || 'Failed to create goal');
    } finally {
      setSaving(false);
    }
  }

  async function toggleGoal(goal) {
    try {
      const updated = await updateGoal(goal.id, { is_completed: !goal.is_completed });
      setGoals(prev => prev.map(g => g.id === goal.id ? updated : g));
    } catch (e) {
      console.error('Toggle goal failed:', e);
    }
  }

  async function deleteGoalById(id) {
    try {
      const { supabase } = await import('../../services/supabaseClient');
      await supabase.from('goals').delete().eq('id', id);
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (e) {
      console.error('Delete goal failed:', e);
    }
  }

  const active    = goals.filter(g => !g.is_completed);
  const completed = goals.filter(g => g.is_completed);
  const completionRate = goals.length
    ? Math.round((completed.length / goals.length) * 100) : 0;

  if (loading) return <Loader />;

  return (
    <div className="animate-fade" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', marginBottom: 4 }}>🎯 Goals</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Set and track your mental wellness goals.</p>
        </div>
        <Button onClick={() => { setError(''); setShowModal(true); }}>+ New Goal</Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Active Goals',     value: active.length,    icon: '⭕', color: 'var(--primary)'  },
          { label: 'Completed',        value: completed.length, icon: '✅', color: 'var(--success)'  },
          { label: 'Completion Rate',  value: `${completionRate}%`, icon: '📊', color: 'var(--warning)' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 14, padding: 20,
            display: 'flex', gap: 14, alignItems: 'center',
          }}>
            <span style={{ fontSize: 32 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {goals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎯</div>
          <h3 style={{ color: 'var(--text2)', marginBottom: 10 }}>No goals yet</h3>
          <p style={{ marginBottom: 24, fontSize: 14 }}>Set your first mental wellness goal to track your progress</p>
          <Button onClick={() => setShowModal(true)}>Create First Goal</Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Active */}
          <Card title={`Active Goals (${active.length})`}>
            {active.length === 0
              ? <div style={{ color: 'var(--success)', fontSize: 13, padding: '12px 0' }}>🎉 All goals completed!</div>
              : active.map(g => (
                <div key={g.id} style={{
                  display: 'flex', gap: 10, padding: '14px 0',
                  borderBottom: '1px solid var(--border)', alignItems: 'flex-start',
                }}>
                  <button onClick={() => toggleGoal(g)} title="Mark complete"
                    style={{ background: 'none', fontSize: 22, cursor: 'pointer', flexShrink: 0, padding: 0, lineHeight: 1 }}>
                    ⭕
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{g.title}</div>
                    {g.description && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>{g.description}</div>}
                    {g.target_date && (
                      <div style={{ fontSize: 11, color: 'var(--primary)', marginTop: 5 }}>
                        📅 Due: {new Date(g.target_date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                  <button onClick={() => deleteGoalById(g.id)} title="Delete"
                    style={{ background: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 16, padding: 0, flexShrink: 0 }}>
                    🗑
                  </button>
                </div>
              ))
            }
          </Card>

          {/* Completed */}
          <Card title={`Completed (${completed.length})`}>
            {completed.length === 0
              ? <div style={{ color: 'var(--text3)', fontSize: 13, padding: '12px 0' }}>Complete your first goal!</div>
              : completed.map(g => (
                <div key={g.id} style={{
                  display: 'flex', gap: 10, padding: '14px 0',
                  borderBottom: '1px solid var(--border)', opacity: 0.7, alignItems: 'flex-start',
                }}>
                  <button onClick={() => toggleGoal(g)} title="Mark incomplete"
                    style={{ background: 'none', fontSize: 22, cursor: 'pointer', flexShrink: 0, padding: 0, lineHeight: 1 }}>
                    ✅
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, textDecoration: 'line-through', color: 'var(--text2)' }}>{g.title}</div>
                    {g.description && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>{g.description}</div>}
                  </div>
                  <button onClick={() => deleteGoalById(g.id)} title="Delete"
                    style={{ background: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 16, padding: 0, flexShrink: 0 }}>
                    🗑
                  </button>
                </div>
              ))
            }
          </Card>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setError(''); }}
        title="New Wellness Goal"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowModal(false); setError(''); }}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving} disabled={!form.title.trim()}>
              Create Goal
            </Button>
          </>
        }
      >
        {error && (
          <div style={{
            background: 'var(--danger-bg)', border: '1px solid var(--danger)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            color: 'var(--danger)', fontSize: 13,
          }}>{error}</div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Goal Title *</label>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Meditate 10 mins daily"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Why is this goal important to you?"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Target Date (optional)</label>
            <input
              type="date"
              value={form.target_date}
              onChange={e => setForm({ ...form, target_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}