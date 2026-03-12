import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRecommendations, markRecommendationRead } from '../../services/dataService';
import { Card, Loader, Badge } from '../../components/ui/index.jsx';

const catColors = { mental: 'var(--primary)', activity: 'var(--success)', sleep: '#a78bfa', stress: 'var(--warning)', wellness: 'var(--info)', diet: '#34d399' };
const catIcons = { mental: '🧠', activity: '🏃', sleep: '🌙', stress: '😤', wellness: '💚', diet: '🥗' };

export function Recommendations() {
  const { profile } = useAuth();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) getRecommendations(profile.id).then(d => { setRecs(d); setLoading(false); }).catch(() => setLoading(false));
  }, [profile?.id]);

  async function handleRead(id) {
    await markRecommendationRead(id);
    setRecs(recs.map(r => r.id === id ? { ...r, is_read: true } : r));
  }

  if (loading) return <Loader />;

  return (
    <div className="animate-fade">
      <div className="page-header"><h1>🤖 AI Recommendations</h1><p>Personalized wellness suggestions based on your mental health data.</p></div>
      {recs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
          <h3 style={{ color: 'var(--text2)' }}>No recommendations yet</h3>
          <p>Complete a mental health survey to receive personalized AI recommendations.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {recs.map(r => (
            <div key={r.id} style={{ background: 'var(--bg2)', border: `1px solid ${r.is_read ? 'var(--border)' : (catColors[r.category] || 'var(--primary)') + '50'}`, borderRadius: 'var(--radius)', padding: 20, opacity: r.is_read ? 0.7 : 1, transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 22 }}>{catIcons[r.category] || '💡'}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: catColors[r.category] || 'var(--primary)', letterSpacing: '0.5px' }}>{r.category}</span>
                </div>
                {!r.is_read && <span style={{ background: 'var(--primary)', borderRadius: '50%', width: 8, height: 8, display: 'block', marginTop: 4 }} />}
              </div>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, marginBottom: 12 }}>{r.content}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                {!r.is_read && <button onClick={() => handleRead(r.id)} style={{ background: 'none', color: 'var(--text3)', fontSize: 12, cursor: 'pointer' }}>Mark read</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Recommendations;