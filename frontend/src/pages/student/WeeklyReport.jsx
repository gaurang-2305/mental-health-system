import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getWeeklyReports, getMoodHistory, getSleepLogs, submitFeedback } from '../../services/dataService';
import { Card, Loader, StarRating, Button, Alert } from '../../components/ui/index.jsx';

export function WeeklyReport() {
  const { profile } = useAuth();
  const [reports, setReports] = useState([]);
  const [moods, setMoods] = useState([]);
  const [sleeps, setSleeps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    Promise.all([getWeeklyReports(profile.id), getMoodHistory(profile.id, 7), getSleepLogs(profile.id, 7)])
      .then(([r, m, s]) => { setReports(r); setMoods(m); setSleeps(s); setLoading(false); }).catch(() => setLoading(false));
  }, [profile?.id]);

  if (loading) return <Loader />;
  const avgMood = moods.length ? (moods.reduce((a, m) => a + m.mood_score, 0) / moods.length).toFixed(1) : null;
  const avgSleep = sleeps.length ? (sleeps.reduce((a, s) => a + (s.sleep_hours || 0), 0) / sleeps.length).toFixed(1) : null;

  return (
    <div className="animate-fade">
      <div className="page-header"><h1>📊 Weekly Report</h1><p>Your mental wellness summary for the past 7 days.</p></div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { icon: '😊', label: 'Avg Mood', value: avgMood ? `${avgMood}/10` : 'N/A', color: 'var(--primary)' },
          { icon: '🌙', label: 'Avg Sleep', value: avgSleep ? `${avgSleep}h` : 'N/A', color: 'var(--info)' },
          { icon: '📔', label: 'Mood Logs', value: moods.length, color: 'var(--success)' },
          { icon: '📅', label: 'Days Tracked', value: new Set(moods.map(m => new Date(m.logged_at).toDateString())).size, color: 'var(--warning)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <Card title="Daily Mood Breakdown">
        {moods.length === 0 ? <div style={{ color: 'var(--text3)', fontSize: 13 }}>No mood data this week.</div> : (
          <div>
            {moods.slice().reverse().map((m, i) => (
              <div key={m.id} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 14, width: 70, color: 'var(--text3)', flexShrink: 0 }}>{new Date(m.logged_at).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span style={{ fontSize: 18 }}>{m.mood_emoji || '😐'}</span>
                <div style={{ flex: 1, height: 10, background: 'var(--border)', borderRadius: 5 }}>
                  <div style={{ height: '100%', width: `${m.mood_score * 10}%`, background: m.mood_score >= 7 ? 'var(--success)' : m.mood_score >= 4 ? 'var(--warning)' : 'var(--danger)', borderRadius: 5 }} />
                </div>
                <span style={{ fontSize: 13, color: 'var(--text2)', width: 36, textAlign: 'right' }}>{m.mood_score}/10</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export function Feedback() {
  const { profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) return setError('Please provide a rating');
    setLoading(true); setError('');
    try {
      await submitFeedback(profile.id, rating, message);
      setSuccess(true); setRating(0); setMessage('');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="animate-fade" style={{ maxWidth: 520 }}>
      <div className="page-header"><h1>💬 Feedback</h1><p>Help us improve MindCare with your thoughts.</p></div>
      {success ? (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🙏</div>
          <h2>Thank you!</h2>
          <p style={{ color: 'var(--text2)', marginTop: 8 }}>Your feedback helps us improve the system for everyone.</p>
          <Button onClick={() => setSuccess(false)} style={{ marginTop: 20 }}>Submit More Feedback</Button>
        </Card>
      ) : (
        <Card title="Share Your Feedback">
          <Alert message={error} type="error" onClose={() => setError('')} />
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">How would you rate MindCare?</label>
              <StarRating value={rating} onChange={setRating} />
              {rating > 0 && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>{['', 'Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'][rating]}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Your message (optional)</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="What did you like? What can be improved?" />
            </div>
            <Button type="submit" loading={loading} disabled={!rating}>Submit Feedback</Button>
          </form>
        </Card>
      )}
    </div>
  );
}

export default WeeklyReport;