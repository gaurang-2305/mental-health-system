import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMoodLogs, getStressScores, getGoals } from '../../services/dataService';
import { StatCard, Card, Badge, Loader } from '../../components/ui/index.jsx';

export default function Dashboard() {
  const { profile } = useAuth();
  const [data, setData] = useState({ moods: [], stress: [], goals: [], recommendations: [], loading: true });

  useEffect(() => {
  if (!profile?.id) return;
  Promise.all([
    getMoodLogs(profile.id, 7),      // was getMoodHistory
    getStressScores(profile.id, 1),
    getGoals(profile.id),
  ]).then(([moods, stress, goals]) => {
    setData({ moods, stress, goals, recommendations: [], loading: false });
  }).catch(() => setData(d => ({ ...d, loading: false })));
}, [profile?.id]);

  if (data.loading) return <Loader text="Loading your dashboard..." />;

  const latestMood = data.moods[0];
  const latestStress = data.stress[0];
  const avgMood = data.moods.length ? (data.moods.reduce((a, m) => a + m.mood_score, 0) / data.moods.length).toFixed(1) : '—';
  const pendingGoals = data.goals.filter(g => !g.is_completed).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const moodEmoji = score => score >= 8 ? '😄' : score >= 6 ? '🙂' : score >= 4 ? '😐' : '😔';
  const riskColor = r => ({ low: 'var(--success)', moderate: 'var(--warning)', high: 'var(--danger)', critical: 'var(--danger)' }[r] || 'var(--text3)');

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem' }}>
          {greeting}, {profile?.full_name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text2)', marginTop: 4 }}>Here's your mental wellness overview for today.</p>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        {[
          { to: '/student/mood', label: '+ Log Mood', color: 'var(--primary)' },
          { to: '/student/survey', label: '📋 Take Survey', color: 'var(--success)' },
          { to: '/student/chatbot', label: '💬 Chat with AI', color: '#a78bfa' },
          { to: '/student/appointments', label: '📅 Book Appointment', color: 'var(--warning)' },
        ].map(a => (
          <Link key={a.to} to={a.to} style={{ padding: '8px 16px', borderRadius: 8, background: `${a.color}15`, border: `1px solid ${a.color}40`, color: a.color, fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = `${a.color}25`}
            onMouseLeave={e => e.currentTarget.style.background = `${a.color}15`}>
            {a.label}
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard icon={latestMood ? moodEmoji(latestMood.mood_score) : '😶'} label="Current Mood" value={latestMood ? `${latestMood.mood_score}/10` : 'Not logged'} sub={latestMood ? 'Today' : 'Log your mood'} color="var(--primary)" />
        <StatCard icon="📊" label="7-Day Avg Mood" value={avgMood !== '—' ? `${avgMood}/10` : '—'} sub="Last 7 days" color="var(--info)" />
        <StatCard icon="😓" label="Stress Level" value={latestStress ? `${Math.round(latestStress.score)}%` : '—'} sub={<span style={{ color: latestStress ? riskColor(latestStress.risk_level) : 'inherit' }}>{latestStress?.risk_level || 'Not measured'}</span>} color="var(--warning)" />
        <StatCard icon="🎯" label="Active Goals" value={pendingGoals} sub={`${data.goals.filter(g => g.is_completed).length} completed`} color="var(--success)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Mood trend */}
        <Card title="Recent Mood Trend">
          {data.moods.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>😊</div>
              <p style={{ fontSize: 13 }}>No mood logs yet. <Link to="/student/mood">Start tracking!</Link></p>
            </div>
          ) : (
            <div>
              {data.moods.slice(0, 7).reverse().map((m, i) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{moodEmoji(m.mood_score)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${m.mood_score * 10}%`, background: m.mood_score >= 7 ? 'var(--success)' : m.mood_score >= 4 ? 'var(--warning)' : 'var(--danger)', borderRadius: 4, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text3)', width: 28, textAlign: 'right' }}>{m.mood_score}/10</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)', width: 32 }}>{new Date(m.logged_at).toLocaleDateString('en', { weekday: 'short' })}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* AI Recommendations */}
        <Card title="AI Recommendations" action={<Link to="/student/recommendations" style={{ fontSize: 12, color: 'var(--primary)' }}>View all</Link>}>
          {data.recommendations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: 13 }}>
              Complete a survey to get AI recommendations
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.recommendations.slice(0, 3).map(r => (
                <div key={r.id} style={{ padding: '10px 12px', background: 'var(--bg3)', borderRadius: 8, borderLeft: '3px solid var(--primary)' }}>
                  <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{r.category}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>{r.content}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Goals */}
        <Card title="Your Goals" action={<Link to="/student/goals" style={{ fontSize: 12, color: 'var(--primary)' }}>Manage</Link>}>
          {data.goals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: 13 }}>
              <Link to="/student/goals">Set your first wellness goal →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.goals.slice(0, 4).map(g => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 16 }}>{g.is_completed ? '✅' : '⭕'}</span>
                  <span style={{ flex: 1, fontSize: 13, color: g.is_completed ? 'var(--text3)' : 'var(--text)', textDecoration: g.is_completed ? 'line-through' : 'none' }}>{g.title}</span>
                  {g.target_date && <span style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(g.target_date).toLocaleDateString()}</span>}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick resources */}
        <Card title="Quick Resources">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: '🧘', label: 'Breathing exercises', to: '/student/stress-relief' },
              { icon: '📔', label: 'Write in journal', to: '/student/journal' },
              { icon: '👥', label: 'Peer support forum', to: '/student/forum' },
              { icon: '📅', label: 'Book a counselor session', to: '/student/appointments' },
            ].map(r => (
              <Link key={r.to} to={r.to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'var(--bg3)', color: 'var(--text)', textDecoration: 'none', fontSize: 13, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}>
                <span>{r.icon}</span><span>{r.label}</span><span style={{ marginLeft: 'auto', color: 'var(--text3)' }}>→</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}