import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { saveJournalEntry, getJournalEntries } from '../../services/dataService';
import { analyzeSentiment } from '../../services/aiService';
import { Button, Card, Loader, Alert } from '../../components/ui/index.jsx';

const PROMPTS = [
  "What made me smile today?",
  "What am I grateful for right now?",
  "What's been weighing on my mind?",
  "What did I accomplish today?",
  "What would make tomorrow better?",
];

export default function Journal() {
  const { profile } = useAuth();
  const [content, setContent] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile?.id) getJournalEntries(profile.id).then(d => { setEntries(d); setFetching(false); }).catch(() => setFetching(false));
  }, [profile?.id]);

  async function handleSave() {
    if (!content.trim()) return;
    setLoading(true); setAnalyzing(true); setError('');
    try {
      const { sentiment, score } = await analyzeSentiment(content);
      setAnalyzing(false);
      const aiAnalysis = sentiment === 'positive' ? "Your writing shows positive emotions and resilience. Keep nurturing these feelings." :
        sentiment === 'negative' ? "I sense some difficult emotions in your writing. Remember, it's okay to feel this way. Consider talking to someone you trust." :
          "Your entry reflects a balanced emotional state. Journaling is a great way to process your thoughts.";
      const entry = await saveJournalEntry(profile.id, content, sentiment, score, aiAnalysis);
      setEntries([entry, ...entries]);
      setContent('');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); setAnalyzing(false); }
  }

  const sentimentIcon = s => ({ positive: '😊', negative: '😔', neutral: '😐' }[s] || '📔');
  const sentimentColor = s => ({ positive: 'var(--success)', negative: 'var(--danger)', neutral: 'var(--text2)' }[s] || 'var(--text3)');

  return (
    <div className="animate-fade">
      <div className="page-header"><h1>📔 AI Journal</h1><p>Write freely. Our AI will analyze your entries to track emotional trends.</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        <div>
          <Card title="New Entry">
            <Alert message={error} type="error" onClose={() => setError('')} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>Prompts:</span>
              {PROMPTS.map(p => (
                <button key={p} onClick={() => setContent(content ? content + '\n\n' + p + ' ' : p + ' ')} style={{ padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text3)', fontSize: 11, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                  {p}
                </button>
              ))}
            </div>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your thoughts here... This is a safe, private space for you." style={{ width: '100%', minHeight: 200, resize: 'vertical', padding: 14, fontSize: 14, lineHeight: 1.7 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>{content.length} characters</span>
              <Button onClick={handleSave} loading={loading} disabled={!content.trim()}>
                {analyzing ? '🔍 Analyzing...' : '💾 Save & Analyze'}
              </Button>
            </div>
          </Card>

          {/* Entry detail */}
          {selected && (
            <Card style={{ marginTop: 20, borderColor: 'var(--border2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 20, marginRight: 8 }}>{sentimentIcon(selected.sentiment)}</span>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize', color: sentimentColor(selected.sentiment) }}>{selected.sentiment} sentiment</span>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18 }}>✕</button>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-wrap', marginBottom: 16 }}>{selected.content}</div>
              {selected.ai_analysis && (
                <div style={{ background: 'var(--primary-glow)', border: '1px solid rgba(79,142,247,0.3)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', marginBottom: 6 }}>🤖 AI Insight</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>{selected.ai_analysis}</div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* History */}
        <Card title="Past Entries">
          {fetching ? <Loader /> : entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)', fontSize: 13 }}>Your journal is empty. Start writing!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {entries.map(entry => (
                <button key={entry.id} onClick={() => setSelected(entry)}
                  style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 10, background: selected?.id === entry.id ? 'var(--primary-glow)' : 'var(--bg3)', border: `1px solid ${selected?.id === entry.id ? 'rgba(79,142,247,0.4)' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>{sentimentIcon(entry.sentiment)}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(entry.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{entry.content}</div>
                  <span style={{ fontSize: 11, color: sentimentColor(entry.sentiment), textTransform: 'capitalize', marginTop: 4, display: 'inline-block' }}>{entry.sentiment}</span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}