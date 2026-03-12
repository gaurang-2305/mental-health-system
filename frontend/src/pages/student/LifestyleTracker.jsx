import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { logLifestyle, getLifestyleLogs } from '../../services/dataService';
import { Button, Card, Loader, Slider, Alert } from '../../components/ui/index.jsx';

export default function LifestyleTracker() {
  const { profile } = useAuth();
  const [form, setForm] = useState({ exercise_type: 'Walking', exercise_minutes: 30, diet_quality: 3, water_intake_liters: 2, notes: '' });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile?.id) getLifestyleLogs(profile.id).then(d => { setLogs(d); setFetching(false); }).catch(() => setFetching(false));
  }, [profile?.id]);

  async function handleSave() {
    setLoading(true);
    try {
      const entry = await logLifestyle(profile.id, form);
      setLogs([entry, ...logs]);
      setSuccess(true); setTimeout(() => setSuccess(false), 3000);
    } finally { setLoading(false); }
  }

  const dietLabel = d => ['', 'Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'][d];

  return (
    <div className="animate-fade">
      <div className="page-header"><h1>🏃 Lifestyle Tracker</h1><p>Log your exercise, diet, and lifestyle for holistic wellness insights.</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24 }}>
        <Card title="Log Today's Lifestyle">
          {success && <Alert message="Lifestyle logged!" type="success" />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Exercise Type</label>
              <select value={form.exercise_type} onChange={e => setForm({ ...form, exercise_type: e.target.value })}>
                {['Walking', 'Running', 'Cycling', 'Swimming', 'Yoga', 'Gym Workout', 'Sports', 'Dancing', 'Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <Slider label={`Exercise Duration: ${form.exercise_minutes} min`} value={form.exercise_minutes} onChange={v => setForm({ ...form, exercise_minutes: v })} min={0} max={180} step={5} />
            <Slider label={`Diet Quality: ${dietLabel(form.diet_quality)}`} value={form.diet_quality} onChange={v => setForm({ ...form, diet_quality: v })} min={1} max={5} />
            <Slider label={`Water Intake: ${form.water_intake_liters}L`} value={form.water_intake_liters} onChange={v => setForm({ ...form, water_intake_liters: v })} min={0} max={5} step={0.5} />
            <div className="form-group"><label className="form-label">Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="How did it feel?" /></div>
          </div>
          <Button onClick={handleSave} loading={loading} style={{ width: '100%', marginTop: 14 }}>Save Entry</Button>
        </Card>

        <Card title="Lifestyle History">
          {fetching ? <Loader /> : logs.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No logs yet. Start tracking your lifestyle!</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {logs.map(log => (
                <div key={log.id} style={{ padding: '12px 14px', background: 'var(--bg3)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>🏃 {log.exercise_type || 'Exercise'}</span>
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(log.logged_date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text2)' }}>
                    {log.exercise_minutes && <span>⏱ {log.exercise_minutes} min</span>}
                    {log.diet_quality && <span>🥗 Diet: {dietLabel(log.diet_quality)}</span>}
                    {log.water_intake_liters && <span>💧 {log.water_intake_liters}L water</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}