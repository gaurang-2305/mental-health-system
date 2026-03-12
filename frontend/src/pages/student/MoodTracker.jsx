import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { recordMood, getMoodHistory } from '../../services/dataService';
import { Button, Card, Loader, Slider } from '../../components/ui/index.jsx';

const EMOJIS = ['😭', '😢', '😟', '😕', '😐', '🙂', '😊', '😄', '🥳', '😁'];
const MOOD_LABELS = ['Very Low', 'Low', 'Below Avg', 'Slightly Low', 'Neutral', 'Okay', 'Good', 'Great', 'Excellent', 'Amazing'];

export default function MoodTracker() {
  const { profile } = useAuth();
  const [score, setScore] = useState(5);
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (profile?.id) getMoodHistory(profile.id, 14).then(d => { setHistory(d); setFetching(false); }).catch(() => setFetching(false));
  }, [profile?.id]);

  async function handleSave() {
    setLoading(true);
    try {
      const emoji = EMOJIS[score - 1];
      const entry = await recordMood(profile.id, score, emoji, notes);
      setHistory([entry, ...history]);
      setNotes(''); setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setLoading(false); }
  }

  const colorForScore = s => s >= 8 ? 'var(--success)' : s >= 6 ? 'var(--primary)' : s >= 4 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1>😊 Mood Tracker</h1>
        <p>Track your daily mood to understand patterns and get personalized insights.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24 }}>
        {/* Log mood */}
        <div>
          <Card title="How are you feeling?">
            {saved && <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: 'var(--success)', fontSize: 13 }}>✅ Mood logged successfully!</div>}

            {/* Big emoji display */}
            <div style={{ textAlign: 'center', padding: '24px 0', background: 'var(--bg3)', borderRadius: 12, marginBottom: 20 }}>
              <div style={{ fontSize: 64, marginBottom: 8, transition: 'all 0.2s' }}>{EMOJIS[score - 1]}</div>
              <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', color: colorForScore(score) }}>{MOOD_LABELS[score - 1]}</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>{score}/10</div>
            </div>

            {/* Emoji grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 20 }}>
              {EMOJIS.map((e, i) => (
                <button key={i} onClick={() => setScore(i + 1)}
                  style={{ padding: '8px 4px', borderRadius: 8, background: score === i + 1 ? `${colorForScore(i + 1)}20` : 'var(--bg3)', border: score === i + 1 ? `2px solid ${colorForScore(i + 1)}` : '2px solid transparent', fontSize: 24, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {e}
                </button>
              ))}
            </div>

            <Slider label="Mood Score" value={score} onChange={setScore} min={1} max={10} />

            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label">Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="What's making you feel this way?" rows={3} style={{ resize: 'vertical' }} />
            </div>

            <Button onClick={handleSave} loading={loading} style={{ width: '100%', marginTop: 16 }}>
              Save Mood Entry
            </Button>
          </Card>
        </div>

        {/* History */}
        <Card title="Mood History">
          {fetching ? <Loader /> : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No mood entries yet. Log your first mood!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.map(entry => (
                <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'var(--bg3)', borderRadius: 10 }}>
                  <span style={{ fontSize: 28 }}>{entry.mood_emoji || EMOJIS[(entry.mood_score || 5) - 1]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, color: colorForScore(entry.mood_score) }}>{MOOD_LABELS[(entry.mood_score || 5) - 1]}</span>
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>({entry.mood_score}/10)</span>
                    </div>
                    {entry.notes && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{entry.notes}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(entry.logged_at).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(entry.logged_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</div>
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