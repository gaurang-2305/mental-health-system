import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRecommendations, markRecommendationRead } from '../../services/dataService';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const catColors = {
  coping: '#4f8ef7', exercise: '#34d399', sleep: '#a78bfa',
  social: '#f472b6', wellness: '#22d3ee', mental: '#fbbf24',
};
const catIcons = {
  coping: '🧘', exercise: '🏃', sleep: '🌙',
  social: '👥', wellness: '💚', mental: '🧠',
};

async function generateFromBackend(token) {
  const res = await fetch(`${API_BASE}/recommendations/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }
  const data = await res.json();
  return data.recommendations || [];
}

export default function Recommendations() {
  const { profile } = useAuth();
  const [recs, setRecs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [generating, setGenerating]   = useState(false);
  const [genError, setGenError]       = useState('');

  useEffect(() => {
    if (profile?.id) {
      getRecommendations(profile.id)
        .then(d => { setRecs(d); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [profile?.id]);

  async function getToken() {
    const { supabase } = await import('../../services/supabaseClient');
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || '';
  }

  async function handleGenerate() {
    setGenerating(true);
    setGenError('');
    try {
      const token = await getToken();
      const newRecs = await generateFromBackend(token);
      setRecs(prev => [...newRecs, ...prev]);
    } catch (err) {
      console.error('Generate recommendations error:', err);
      setGenError(`Failed to generate: ${err.message}. Check GROK_API_KEY in backend .env`);
    } finally {
      setGenerating(false);
    }
  }

  async function handleRead(id) {
    await markRecommendationRead(id).catch(() => {});
    setRecs(prev => prev.map(r => r.id === id ? { ...r, is_read: true } : r));
  }

  async function handleMarkAllRead() {
    await Promise.all(recs.filter(r => !r.is_read).map(r => markRecommendationRead(r.id)));
    setRecs(prev => prev.map(r => ({ ...r, is_read: true })));
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const unread = recs.filter(r => !r.is_read).length;

  return (
    <div className="animate-fade" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', marginBottom: 4 }}>🤖 AI Recommendations</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Personalised wellness suggestions powered by Grok AI.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {unread > 0 && (
            <button onClick={handleMarkAllRead}
              style={{ padding: '9px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text2)', cursor: 'pointer', fontSize: 13 }}>
              ✓ Mark all read
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              padding: '9px 20px', borderRadius: 10, border: 'none',
              background: generating ? 'var(--surface)' : 'var(--primary)',
              color: generating ? 'var(--text3)' : '#fff',
              cursor: generating ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            {generating
              ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Generating...</>
              : '✨ Generate New'}
          </button>
        </div>
      </div>

      {genError && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: 'var(--danger)', fontSize: 13 }}>
          ⚠️ {genError}
        </div>
      )}

      {recs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🤖</div>
          <h3 style={{ color: 'var(--text)', marginBottom: 10, fontFamily: 'var(--font-display)' }}>No recommendations yet</h3>
          <p style={{ color: 'var(--text2)', marginBottom: 24, fontSize: 14, maxWidth: 380, margin: '0 auto 24px' }}>
            Click "Generate New" to get AI-powered personalised wellness suggestions. Requires <code>GROK_API_KEY</code> in backend <code>.env</code>.
          </p>
          <button onClick={handleGenerate} disabled={generating}
            style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'var(--primary)', color: '#fff', cursor: generating ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 14 }}>
            {generating ? '✨ Generating...' : '✨ Generate Recommendations'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {recs.map(r => {
            const color = catColors[r.category] || 'var(--primary)';
            const icon  = catIcons[r.category]  || '💡';
            return (
              <div key={r.id || Math.random()} style={{
                background: 'var(--bg2)',
                border: `1px solid ${r.is_read ? 'var(--border)' : color + '50'}`,
                borderLeft: `4px solid ${r.is_read ? 'var(--border)' : color}`,
                borderRadius: 14, padding: 20,
                opacity: r.is_read ? 0.7 : 1,
                transition: 'all 0.2s', position: 'relative',
              }}>
                {!r.is_read && (
                  <div style={{ position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: '50%', background: color }} />
                )}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color, letterSpacing: '0.5px' }}>
                    {r.category}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.65, marginBottom: 14 }}>
                  {r.content}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {r.created_at ? new Date(r.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : 'New'}
                  </span>
                  {!r.is_read && r.id && (
                    <button onClick={() => handleRead(r.id)}
                      style={{ background: 'none', color: 'var(--text3)', fontSize: 12, cursor: 'pointer', border: 'none', padding: 0 }}>
                      Mark read ✓
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}