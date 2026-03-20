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
      getMoodLogs(profile.id, 7),
      getStressScores(profile.id, 1),
      getGoals(profile.id),
    ]).then(([moods, stress, goals]) => {
      setData({ moods, stress, goals, recommendations: [], loading: false });
    }).catch(() => setData(d => ({ ...d, loading: false })));
  }, [profile?.id]);

  if (data.loading) return <Loader text="Loading your dashboard…" />;

  const latestMood   = data.moods[0];
  const latestStress = data.stress[0];
  const avgMood = data.moods.length
    ? (data.moods.reduce((a, m) => a + m.mood_score, 0) / data.moods.length).toFixed(1)
    : '—';
  const pendingGoals = data.goals.filter(g => !g.is_completed).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const moodEmoji = score => score >= 8 ? '✦' : score >= 6 ? '◎' : score >= 4 ? '◐' : '◑';
  const moodColor = score => score >= 8 ? '#5a8a65' : score >= 6 ? '#a07850' : score >= 4 ? '#b88c18' : '#b84a4a';
  const riskColor = r => ({ low: '#5a8a65', moderate: '#b88c18', high: '#c06420', critical: '#b84a4a' }[r] || '#a8896e');

  const quickActions = [
    { to: '/student/mood',         label: 'Log Mood',         icon: '◎', color: '#a07850' },
    { to: '/student/survey',       label: 'Daily Survey',     icon: '✦', color: '#5a8a65' },
    { to: '/student/chatbot',      label: 'Chat with AI',     icon: '◈', color: '#4a7a9b' },
    { to: '/student/appointments', label: 'Book Session',     icon: '◻', color: '#b88c18' },
  ];

  return (
    <div className="animate-fade" style={{ padding: '32px 36px', maxWidth: 1280 }}>

      {/* ─── Header ─── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '2px',
              color: '#c4a882', textTransform: 'uppercase',
              marginBottom: 6, fontFamily: "'Outfit', sans-serif",
            }}>
              {greeting}
            </p>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '2.4rem', fontWeight: 600,
              color: '#2c1f12', marginBottom: 6, letterSpacing: '0.01em',
            }}>
              {profile?.full_name?.split(' ')[0] || 'Welcome'} ✦
            </h1>
            <p style={{ color: '#a8896e', fontSize: 14, fontFamily: "'Outfit', sans-serif" }}>
              Here's your mental wellness overview for today.
            </p>
          </div>
          <div style={{
            background: 'rgba(255,252,248,0.8)',
            border: '1px solid rgba(160,120,80,0.18)',
            borderRadius: 14, padding: '12px 18px',
            backdropFilter: 'blur(8px)',
          }}>
            <div style={{ fontSize: 10, color: '#c4a882', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 4, fontFamily: "'Outfit', sans-serif" }}>Today</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', color: '#2c1f12' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
          {quickActions.map(a => (
            <Link key={a.to} to={a.to} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 18px',
              borderRadius: 30,
              background: 'rgba(255,252,248,0.85)',
              border: `1px solid ${a.color}30`,
              color: a.color,
              fontSize: 12.5,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.18s',
              fontFamily: "'Outfit', sans-serif",
              backdropFilter: 'blur(8px)',
              boxShadow: `0 2px 8px ${a.color}15`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = `${a.color}12`;
              e.currentTarget.style.borderColor = `${a.color}55`;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,252,248,0.85)';
              e.currentTarget.style.borderColor = `${a.color}30`;
              e.currentTarget.style.transform = 'none';
            }}
            >
              <span style={{ fontFamily: 'system-ui', fontSize: 13 }}>{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          {
            label: 'Current Mood',
            value: latestMood ? `${latestMood.mood_score}/10` : 'Not logged',
            icon: latestMood ? moodEmoji(latestMood.mood_score) : '◎',
            sub: latestMood ? 'Today' : 'Log your mood',
            color: latestMood ? moodColor(latestMood.mood_score) : '#a8896e',
          },
          {
            label: '7-Day Avg Mood',
            value: avgMood !== '—' ? `${avgMood}/10` : '—',
            icon: '◈',
            sub: 'Last 7 days',
            color: '#4a7a9b',
          },
          {
            label: 'Stress Level',
            value: latestStress ? `${Math.round(latestStress.score)}%` : '—',
            icon: '◉',
            sub: <span style={{ color: latestStress ? riskColor(latestStress.risk_level) : 'inherit' }}>
              {latestStress?.risk_level || 'Not measured'}
            </span>,
            color: '#b88c18',
          },
          {
            label: 'Active Goals',
            value: pendingGoals,
            icon: '◇',
            sub: `${data.goals.filter(g => g.is_completed).length} completed`,
            color: '#5a8a65',
          },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,252,248,0.9)',
            border: '1px solid rgba(160,120,80,0.16)',
            borderRadius: 16, padding: '20px 22px',
            boxShadow: '0 2px 12px rgba(80,50,20,0.07)',
            transition: 'box-shadow 0.2s, transform 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(80,50,20,0.13)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(80,50,20,0.07)'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: '#a8896e', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: "'Outfit', sans-serif" }}>
                {s.label}
              </span>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: `${s.color}14`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, color: s.color,
              }}>
                {s.icon}
              </div>
            </div>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '2rem', fontWeight: 600,
              color: s.color, lineHeight: 1, marginBottom: 5,
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11.5, color: '#c4a882', fontFamily: "'Outfit', sans-serif" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ─── Content Grid ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Mood Trend */}
        <div style={{
          background: 'rgba(255,252,248,0.9)',
          border: '1px solid rgba(160,120,80,0.14)',
          borderRadius: 16, padding: '22px 24px',
          boxShadow: '0 2px 12px rgba(80,50,20,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: '#2c1f12', fontWeight: 500 }}>
                Mood Trend
              </div>
              <div style={{ fontSize: 11, color: '#c4a882', fontFamily: "'Outfit', sans-serif" }}>Last 7 days</div>
            </div>
            <Link to="/student/mood" style={{ fontSize: 11.5, color: '#a07850', fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
              Track mood →
            </Link>
          </div>

          {data.moods.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#c4a882' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.4rem', marginBottom: 8 }}>◎</div>
              <p style={{ fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
                No mood logs yet.{' '}
                <Link to="/student/mood" style={{ color: '#a07850', fontWeight: 600 }}>Start tracking!</Link>
              </p>
            </div>
          ) : (
            <div>
              {data.moods.slice(0, 7).reverse().map((m, i) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 9 }}>
                  <span style={{ fontSize: 11, color: '#c4a882', width: 28, flexShrink: 0, fontFamily: "'Outfit', sans-serif" }}>
                    {new Date(m.logged_at).toLocaleDateString('en', { weekday: 'short' })}
                  </span>
                  <div style={{ flex: 1, height: 7, background: 'rgba(160,120,80,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${m.mood_score * 10}%`,
                      background: m.mood_score >= 7 ? '#5a8a65' : m.mood_score >= 4 ? '#a07850' : '#b84a4a',
                      borderRadius: 4,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: 11.5, color: '#a8896e', width: 30, textAlign: 'right', fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
                    {m.mood_score}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        <div style={{
          background: 'rgba(255,252,248,0.9)',
          border: '1px solid rgba(160,120,80,0.14)',
          borderRadius: 16, padding: '22px 24px',
          boxShadow: '0 2px 12px rgba(80,50,20,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: '#2c1f12', fontWeight: 500 }}>
                AI Recommendations
              </div>
              <div style={{ fontSize: 11, color: '#c4a882', fontFamily: "'Outfit', sans-serif" }}>Personalised for you</div>
            </div>
            <Link to="/student/recommendations" style={{ fontSize: 11.5, color: '#a07850', fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
              View all →
            </Link>
          </div>
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#c4a882' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.4rem', marginBottom: 8 }}>✧</div>
            <p style={{ fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
              Complete a survey to get AI-powered recommendations.
            </p>
            <Link to="/student/survey" style={{
              display: 'inline-block', marginTop: 12,
              padding: '8px 18px', borderRadius: 20,
              background: 'rgba(160,120,80,0.1)',
              border: '1px solid rgba(160,120,80,0.25)',
              color: '#a07850', fontSize: 12.5,
              fontWeight: 600, fontFamily: "'Outfit', sans-serif",
              textDecoration: 'none',
            }}>
              Take Survey →
            </Link>
          </div>
        </div>

        {/* Goals */}
        <div style={{
          background: 'rgba(255,252,248,0.9)',
          border: '1px solid rgba(160,120,80,0.14)',
          borderRadius: 16, padding: '22px 24px',
          boxShadow: '0 2px 12px rgba(80,50,20,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: '#2c1f12', fontWeight: 500 }}>
                Your Goals
              </div>
              <div style={{ fontSize: 11, color: '#c4a882', fontFamily: "'Outfit', sans-serif" }}>{pendingGoals} active</div>
            </div>
            <Link to="/student/goals" style={{ fontSize: 11.5, color: '#a07850', fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
              Manage →
            </Link>
          </div>
          {data.goals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px 0', color: '#c4a882', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
              <Link to="/student/goals" style={{ color: '#a07850', fontWeight: 600 }}>Set your first wellness goal →</Link>
            </div>
          ) : (
            <div>
              {data.goals.slice(0, 4).map(g => (
                <div key={g.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '9px 0', borderBottom: '1px solid rgba(160,120,80,0.1)',
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: g.is_completed ? '#5a8a6520' : 'transparent',
                    border: `1.5px solid ${g.is_completed ? '#5a8a65' : 'rgba(160,120,80,0.35)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: '#5a8a65', flexShrink: 0,
                  }}>
                    {g.is_completed ? '✓' : ''}
                  </div>
                  <span style={{
                    flex: 1, fontSize: 13.5,
                    color: g.is_completed ? '#c4a882' : '#2c1f12',
                    textDecoration: g.is_completed ? 'line-through' : 'none',
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    {g.title}
                  </span>
                  {g.target_date && (
                    <span style={{ fontSize: 11, color: '#c4a882', fontFamily: "'Outfit', sans-serif" }}>
                      {new Date(g.target_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Resources */}
        <div style={{
          background: 'rgba(255,252,248,0.9)',
          border: '1px solid rgba(160,120,80,0.14)',
          borderRadius: 16, padding: '22px 24px',
          boxShadow: '0 2px 12px rgba(80,50,20,0.06)',
        }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: '#2c1f12', fontWeight: 500 }}>
              Quick Resources
            </div>
            <div style={{ fontSize: 11, color: '#c4a882', fontFamily: "'Outfit', sans-serif" }}>Jump right in</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[
              { icon: '◎', label: 'Breathing exercises',    to: '/student/stress-relief', color: '#5a8a65' },
              { icon: '❋', label: 'Write in journal',       to: '/student/journal',       color: '#a07850' },
              { icon: '◯', label: 'Peer support forum',    to: '/student/forum',         color: '#4a7a9b' },
              { icon: '◻', label: 'Book a counselor session', to: '/student/appointments', color: '#b88c18' },
            ].map(r => (
              <Link key={r.to} to={r.to} style={{
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '10px 14px', borderRadius: 10,
                background: `${r.color}08`,
                border: `1px solid ${r.color}18`,
                color: '#2c1f12', textDecoration: 'none',
                fontSize: 13.5, transition: 'all 0.16s',
                fontFamily: "'Outfit', sans-serif",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${r.color}14`; e.currentTarget.style.borderColor = `${r.color}35`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${r.color}08`; e.currentTarget.style.borderColor = `${r.color}18`; }}
              >
                <span style={{ color: r.color, fontSize: 14, fontFamily: 'system-ui' }}>{r.icon}</span>
                <span>{r.label}</span>
                <span style={{ marginLeft: 'auto', color: '#c4a882', fontSize: 12 }}>→</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}