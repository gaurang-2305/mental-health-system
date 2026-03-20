import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { saveJournalEntry, getJournalEntries } from '../../services/dataService';

const PROMPTS = [
  "What made me smile today?",
  "What am I grateful for right now?",
  "What's been weighing on my mind?",
  "What did I accomplish today?",
  "What would make tomorrow better?",
];

// Real AI sentiment analysis via Anthropic
async function analyzeWithAI(content) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Analyze this journal entry for emotional sentiment. Be honest and accurate — don't default to positive.

Journal entry:
"${content}"

Respond in this exact JSON format (no markdown, no extra text):
{"sentiment":"positive"|"neutral"|"negative","score":0.0-1.0,"analysis":"2-3 warm supportive sentences about the emotional content","emotions":["emotion1","emotion2"]}

Rules:
- score 0.0-0.4 = negative, 0.4-0.6 = neutral, 0.6-1.0 = positive
- Be accurate to the actual content, not overly optimistic
- Emotions should reflect what's actually expressed`,
        }],
      }),
    });

    if (!response.ok) throw new Error(`API ${response.status}`);
    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return {
      sentiment: parsed.sentiment || 'neutral',
      score:     Math.max(0, Math.min(1, Number(parsed.score) || 0.5)),
      analysis:  parsed.analysis || null,
      emotions:  parsed.emotions || [],
    };
  } catch (err) {
    console.warn('AI analysis failed, using keyword fallback:', err.message);
    return keywordFallback(content);
  }
}

// Accurate keyword fallback
function keywordFallback(text) {
  const lower = text.toLowerCase();
  const pos = ['happy','great','good','excited','grateful','calm','peaceful','joy','love','better','wonderful','hopeful','proud','motivated','relaxed','content','smile','laugh'];
  const neg = ['sad','depressed','anxious','stress','worried','angry','hopeless','tired','awful','terrible','bad','cry','hurt','alone','scared','afraid','overwhelmed','frustrated','numb','empty','worthless','miserable','hate','fail'];
  const posCount = pos.filter(w => lower.includes(w)).length;
  const negCount = neg.filter(w => lower.includes(w)).length;

  if (posCount > negCount + 1) return { sentiment: 'positive', score: Math.min(0.9, 0.6 + posCount * 0.06), analysis: 'Your entry reflects positive emotions. Keep nurturing these good feelings!', emotions: ['hopeful'] };
  if (negCount > posCount + 1) return { sentiment: 'negative', score: Math.max(0.1, 0.4 - negCount * 0.05), analysis: 'Your entry suggests you\'re going through a tough time. It\'s okay to feel this way — consider talking to someone you trust.', emotions: ['distressed'] };
  return { sentiment: 'neutral', score: 0.5, analysis: 'Your entry has a balanced, reflective tone. Journaling regularly helps you track emotional patterns over time.', emotions: ['reflective'] };
}

const sentimentConfig = {
  positive: { icon: '😊', color: '#34d399', label: 'Positive', bg: 'rgba(52,211,153,0.1)' },
  neutral:  { icon: '😐', color: '#fbbf24', label: 'Neutral',  bg: 'rgba(251,191,36,0.1)'  },
  negative: { icon: '😔', color: '#f87171', label: 'Negative', bg: 'rgba(248,113,113,0.1)' },
};

export default function Journal() {
  const { profile } = useAuth();
  const [content, setContent]   = useState('');
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selected, setSelected] = useState(null);
  const [error, setError]       = useState('');
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    if (profile?.id) {
      getJournalEntries(profile.id)
        .then(d => { setEntries(d); setFetching(false); })
        .catch(() => setFetching(false));
    }
  }, [profile?.id]);

  async function handleSave() {
    if (!content.trim()) return;
    if (content.trim().length < 10) { setError('Please write at least 10 characters.'); return; }
    setLoading(true);
    setAnalyzing(true);
    setError('');
    setLastResult(null);

    try {
      const result = await analyzeWithAI(content);
      setAnalyzing(false);
      setLastResult(result);

      const entry = await saveJournalEntry(
        profile.id,
        content.trim(),
        result.sentiment,
        result.score,
        result.analysis,
      );
      setEntries(prev => [entry, ...prev]);
      setContent('');
    } catch (e) {
      setError(e.message || 'Failed to save entry');
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  }

  const cfg = s => sentimentConfig[s] || sentimentConfig.neutral;

  return (
    <div className="animate-fade" style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', marginBottom: 4 }}>📔 AI Journal</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Write freely. Claude AI will analyze your entries to track emotional trends.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        {/* Editor */}
        <div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>New Entry</span>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>

            {/* Prompts */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--text3)', marginRight: 2 }}>Prompts:</span>
              {PROMPTS.map(p => (
                <button key={p} onClick={() => setContent(c => c ? c + '\n\n' + p + ' ' : p + ' ')}
                  style={{
                    padding: '4px 10px', borderRadius: 20,
                    border: '1px solid var(--border)', background: 'var(--bg3)',
                    color: 'var(--text3)', fontSize: 11, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  {p}
                </button>
              ))}
            </div>

            <textarea
              value={content}
              onChange={e => { setContent(e.target.value); setError(''); }}
              placeholder="Write your thoughts here... This is a safe, private space for you."
              style={{ width: '100%', minHeight: 220, resize: 'vertical', padding: 16, fontSize: 14, lineHeight: 1.7, border: 'none', background: 'transparent', outline: 'none', color: 'var(--text)' }}
            />

            {error && (
              <div style={{ margin: '0 16px 12px', padding: '8px 12px', background: 'var(--danger-bg)', borderRadius: 8, color: 'var(--danger)', fontSize: 12 }}>{error}</div>
            )}

            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>{content.length} characters</span>
              <button
                onClick={handleSave}
                disabled={loading || !content.trim()}
                style={{
                  padding: '9px 20px', borderRadius: 10, border: 'none',
                  background: content.trim() && !loading ? 'var(--primary)' : 'var(--surface)',
                  color: content.trim() && !loading ? '#fff' : 'var(--text3)',
                  cursor: content.trim() && !loading ? 'pointer' : 'not-allowed',
                  fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {analyzing ? (
                  <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Analyzing...</>
                ) : loading ? '💾 Saving...' : '🔍 Save & Analyze'}
              </button>
            </div>
          </div>

          {/* Last analysis result */}
          {lastResult && (
            <div style={{
              marginTop: 16, padding: 20,
              background: cfg(lastResult.sentiment).bg,
              border: `1px solid ${cfg(lastResult.sentiment).color}40`,
              borderRadius: 12, animation: 'fadeIn 0.3s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{cfg(lastResult.sentiment).icon}</span>
                <div>
                  <span style={{ fontWeight: 700, color: cfg(lastResult.sentiment).color, fontSize: 14 }}>
                    {cfg(lastResult.sentiment).label} Sentiment
                  </span>
                  {lastResult.emotions?.length > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                      {lastResult.emotions.join(' · ')}
                    </div>
                  )}
                </div>
                {/* Score bar */}
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', marginLeft: 8 }}>
                  <div style={{ height: '100%', width: `${lastResult.score * 100}%`, background: cfg(lastResult.sentiment).color, borderRadius: 3 }} />
                </div>
              </div>
              {lastResult.analysis && (
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>
                  🤖 <em>{lastResult.analysis}</em>
                </p>
              )}
            </div>
          )}

          {/* Selected entry detail */}
          {selected && (
            <div style={{ marginTop: 16, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{cfg(selected.sentiment).icon}</span>
                  <span style={{ fontWeight: 600, color: cfg(selected.sentiment).color, fontSize: 13 }}>
                    {cfg(selected.sentiment).label}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {new Date(selected.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18, border: 'none' }}>✕</button>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-wrap', marginBottom: 14 }}>
                  {selected.content}
                </div>
                {selected.ai_analysis && (
                  <div style={{ background: 'var(--primary-glow)', border: '1px solid rgba(79,142,247,0.3)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', marginBottom: 6 }}>🤖 AI Insight</div>
                    <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{selected.ai_analysis}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* History sidebar */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Past Entries</span>
            <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 8 }}>({entries.length})</span>
          </div>

          <div style={{ maxHeight: 600, overflowY: 'auto' }}>
            {fetching ? (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Loading...</div>
            ) : entries.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                Your journal is empty.<br />Start writing your first entry!
              </div>
            ) : (
              entries.map(entry => {
                const c = cfg(entry.sentiment);
                return (
                  <button key={entry.id} onClick={() => setSelected(selected?.id === entry.id ? null : entry)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '14px 16px',
                      borderBottom: '1px solid var(--border)',
                      background: selected?.id === entry.id ? 'var(--primary-glow)' : 'transparent',
                      border: 'none',
                      borderLeft: `3px solid ${selected?.id === entry.id ? 'var(--primary)' : 'transparent'}`,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (selected?.id !== entry.id) e.currentTarget.style.background = 'var(--bg3)'; }}
                    onMouseLeave={e => { if (selected?.id !== entry.id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: c.color,
                        background: c.bg, padding: '2px 8px', borderRadius: 12,
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        {c.icon} {c.label}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                        {new Date(entry.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 12, color: 'var(--text2)', lineHeight: 1.5,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {entry.content}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}