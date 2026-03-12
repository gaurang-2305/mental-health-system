import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { recordSleep, getSleepLogs } from '../../services/dataService';
import { Button, Card, Loader, Slider, Alert } from '../../components/ui/index.jsx';

export default function SleepTracker() {
  const { profile } = useAuth();
  const [form, setForm] = useState({ bedtime: '22:30', wake_time: '06:30', sleep_quality: 3 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile?.id) getSleepLogs(profile.id).then(d => { setLogs(d); setFetching(false); }).catch(() => setFetching(false));
  }, [profile?.id]);

  function calcHours(bed, wake) {
    const [bh, bm] = bed.split(':').map(Number);
    const [wh, wm] = wake.split(':').map(Number);
    let diff = (wh * 60 + wm) - (bh * 60 + bm);
    if (diff < 0) diff += 24 * 60;
    return +(diff / 60).toFixed(1);
  }

  async function handleSave() {
    setLoading(true);
    try {
      const sleep_hours = calcHours(form.bedtime, form.wake_time);
      const entry = await recordSleep(profile.id, { bedtime: form.bedtime, wake_time: form.wake_time, sleep_hours, sleep_quality: form.sleep_quality });
      setLogs([entry, ...logs]);
      setSuccess(true); setTimeout(() => setSuccess(false), 3000);
    } finally { setLoading(false); }
  }

  const qualityLabel = q => ['', 'Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'][q];
  const qualityColor = q => q >= 4 ? 'var(--success)' : q >= 3 ? 'var(--warning)' : 'var(--danger)';
  const hoursColor = h => h >= 7 ? 'var(--success)' : h >= 5 ? 'var(--warning)' : 'var(--danger)';
  const projected = calcHours(form.bedtime, form.wake_time);

  return (
    <div className="animate-fade">
      <div className="page-header"><h1>🌙 Sleep Tracker</h1><p>Track your sleep patterns for better mental health.</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>
        <div>
          <Card title="Log Tonight's Sleep">
            {success && <Alert message="Sleep logged successfully!" type="success" />}
            <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '16px', textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', color: hoursColor(projected) }}>{projected}h</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>Projected sleep duration</div>
              <div style={{ fontSize: 12, color: projected >= 7 ? 'var(--success)' : projected >= 5 ? 'var(--warning)' : 'var(--danger)', marginTop: 4, fontWeight: 500 }}>
                {projected >= 8 ? '✅ Excellent!' : projected >= 7 ? '✅ Good' : projected >= 6 ? '⚠️ A bit short' : '❌ Too little'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">🌛 Bedtime</label>
                <input type="time" value={form.bedtime} onChange={e => setForm({ ...form, bedtime: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">🌅 Wake Time</label>
                <input type="time" value={form.wake_time} onChange={e => setForm({ ...form, wake_time: e.target.value })} />
              </div>
              <Slider label={`Sleep Quality: ${qualityLabel(form.sleep_quality)}`} value={form.sleep_quality} onChange={v => setForm({ ...form, sleep_quality: v })} min={1} max={5} />
            </div>
            <Button onClick={handleSave} loading={loading} style={{ width: '100%', marginTop: 16 }}>Save Sleep Log</Button>
          </Card>

          <Card title="Sleep Tips" style={{ marginTop: 16 }}>
            {['Maintain a consistent sleep schedule', 'Avoid screens 1 hour before bed', 'Keep room cool and dark', 'Avoid caffeine after 2 PM', '7-9 hours is recommended for young adults'].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--text2)' }}><span style={{ color: 'var(--primary)' }}>•</span>{tip}</div>
            ))}
          </Card>
        </div>

        <Card title="Sleep History">
          {fetching ? <Loader /> : logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No sleep logs yet. Start tracking tonight!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {logs.map(log => (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'var(--bg3)', borderRadius: 10 }}>
                  <span style={{ fontSize: 28 }}>🌙</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: hoursColor(log.sleep_hours || 0) }}>{log.sleep_hours}h sleep</span>
                      <span style={{ fontSize: 12, color: qualityColor(log.sleep_quality), background: `${qualityColor(log.sleep_quality)}18`, padding: '2px 8px', borderRadius: 12 }}>{qualityLabel(log.sleep_quality)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>
                      {log.bedtime && `${log.bedtime} → ${log.wake_time}`}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(log.logged_date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}