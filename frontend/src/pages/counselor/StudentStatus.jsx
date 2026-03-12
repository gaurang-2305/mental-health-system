import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import Card from '../../components/ui/Card';
import RiskBadge from '../../components/crisis/RiskBadge';
import Badge from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { PageLoader } from '../../components/ui/Loader';
import { formatDate, getInitials, stringToColor, getMoodColor, getMoodEmoji, getRelativeTime } from '../../utils/helpers';

const StudentStatus = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortBy, setSortBy] = useState('risk');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, phone, class_year, age, created_at')
        .eq('role_id', 1)
        .order('full_name');

      if (!profiles?.length) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const userIds = profiles.map((p) => p.id);

      const [
        { data: moods },
        { data: scores },
        { data: surveys },
        { data: appointments },
      ] = await Promise.all([
        supabase
          .from('mood_logs')
          .select('user_id, mood_score, created_at')
          .in('user_id', userIds)
          .order('created_at', { ascending: false }),
        supabase
          .from('stress_scores')
          .select('user_id, score, risk_level, created_at')
          .in('user_id', userIds)
          .order('created_at', { ascending: false }),
        supabase
          .from('surveys')
          .select('user_id, created_at')
          .in('user_id', userIds)
          .order('created_at', { ascending: false }),
        supabase
          .from('appointments')
          .select('user_id: student_id, status, scheduled_at')
          .in('student_id', userIds)
          .eq('status', 'confirmed')
          .order('scheduled_at', { ascending: true }),
      ]);

      // Build lookup maps (latest entry per user)
      const moodMap = {};
      (moods || []).forEach((m) => {
        if (!moodMap[m.user_id]) moodMap[m.user_id] = m;
      });
      const scoreMap = {};
      (scores || []).forEach((s) => {
        if (!scoreMap[s.user_id]) scoreMap[s.user_id] = s;
      });
      const surveyMap = {};
      (surveys || []).forEach((s) => {
        if (!surveyMap[s.user_id]) surveyMap[s.user_id] = s;
      });
      const apptMap = {};
      (appointments || []).forEach((a) => {
        if (!apptMap[a.user_id]) apptMap[a.user_id] = a;
      });

      const enriched = profiles.map((p) => ({
        ...p,
        latestMood: moodMap[p.id] || null,
        latestScore: scoreMap[p.id] || null,
        latestSurvey: surveyMap[p.id] || null,
        nextAppointment: apptMap[p.id] || null,
      }));

      setStudents(enriched);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter + sort
  const RISK_ORDER = { critical: 0, high: 1, moderate: 2, low: 3 };

  const filtered = students
    .filter((s) => {
      const matchSearch =
        !search ||
        s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.class_year?.toLowerCase().includes(search.toLowerCase());

      const matchRisk =
        riskFilter === 'all' ||
        (s.latestScore?.risk_level || 'none') === riskFilter;

      return matchSearch && matchRisk;
    })
    .sort((a, b) => {
      if (sortBy === 'risk') {
        const aR = RISK_ORDER[a.latestScore?.risk_level] ?? 4;
        const bR = RISK_ORDER[b.latestScore?.risk_level] ?? 4;
        return aR - bR;
      }
      if (sortBy === 'name') return (a.full_name || '').localeCompare(b.full_name || '');
      if (sortBy === 'mood') return (b.latestMood?.mood_score || 0) - (a.latestMood?.mood_score || 0);
      return 0;
    });

  // Summary counts
  const riskCounts = students.reduce((acc, s) => {
    const r = s.latestScore?.risk_level || 'none';
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <PageLoader text="Loading student status..." />;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Student Status</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Monitor wellbeing across {students.length} students
        </p>
      </div>

      {/* Risk summary chips */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'critical', label: 'Critical', color: '#f87171' },
          { key: 'high', label: 'High', color: '#f97316' },
          { key: 'moderate', label: 'Moderate', color: '#fbbf24' },
          { key: 'low', label: 'Low', color: '#34d399' },
        ].map(({ key, label, color }) => (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: `${color}11`,
              border: `1px solid ${color}33`,
              cursor: 'pointer',
              opacity: riskFilter !== 'all' && riskFilter !== key ? 0.5 : 1,
              transition: 'all 0.15s',
            }}
            onClick={() => setRiskFilter(riskFilter === key ? 'all' : key)}
          >
            <span
              style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }}
            />
            <span style={{ fontSize: '13px', fontWeight: 600, color }}>
              {riskCounts[key] || 0}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {riskCounts['none'] || 0}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No data</span>
        </div>
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <Input
            placeholder="Search by name, email, or class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix="🔍"
            containerStyle={{ marginBottom: 0 }}
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            padding: '10px 14px',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <option value="risk">Sort: Risk Level</option>
          <option value="name">Sort: Name</option>
          <option value="mood">Sort: Mood Score</option>
        </select>
        <button
          onClick={fetchStudents}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.06)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Student cards */}
      {filtered.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '14px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
            No students found matching your filters.
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filtered.map((student) => {
            const initials = getInitials(student.full_name);
            const avatarColor = stringToColor(student.full_name);
            const mood = student.latestMood;
            const score = student.latestScore;
            const moodColor = mood ? getMoodColor(mood.mood_score) : 'var(--text-muted)';
            const moodEmoji = mood ? getMoodEmoji(mood.mood_score) : null;

            return (
              <div
                key={student.id}
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${
                    score?.risk_level === 'critical'
                      ? 'rgba(248,113,113,0.4)'
                      : score?.risk_level === 'high'
                      ? 'rgba(249,115,22,0.3)'
                      : 'var(--border)'
                  }`,
                  borderRadius: '14px',
                  padding: '18px',
                  transition: 'border-color 0.2s',
                }}
              >
                {/* Student header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: avatarColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {student.full_name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>
                      {student.class_year || 'No class'} · {student.email}
                    </div>
                  </div>
                  {score ? (
                    <RiskBadge risk={score.risk_level} size="xs" />
                  ) : (
                    <span
                      style={{
                        fontSize: '10px',
                        color: 'var(--text-muted)',
                        background: 'rgba(255,255,255,0.06)',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        flexShrink: 0,
                      }}
                    >
                      No data
                    </span>
                  )}
                </div>

                {/* Metrics row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    marginBottom: '12px',
                  }}
                >
                  {/* Mood */}
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '8px',
                      padding: '10px 8px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '18px', marginBottom: '2px' }}>
                      {moodEmoji ? moodEmoji.emoji : '—'}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: moodColor }}>
                      {mood ? `${mood.mood_score}/10` : 'N/A'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Mood</div>
                  </div>

                  {/* Stress score */}
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '8px',
                      padding: '10px 8px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '18px', marginBottom: '2px' }}>😰</div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: score
                          ? score.risk_level === 'critical'
                            ? '#f87171'
                            : score.risk_level === 'high'
                            ? '#f97316'
                            : score.risk_level === 'moderate'
                            ? '#fbbf24'
                            : '#34d399'
                          : 'var(--text-muted)',
                      }}
                    >
                      {score ? score.score : 'N/A'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Stress</div>
                  </div>

                  {/* Last survey */}
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '8px',
                      padding: '10px 8px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '18px', marginBottom: '2px' }}>📋</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {student.latestSurvey
                        ? getRelativeTime(student.latestSurvey.created_at)
                        : 'Never'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Survey</div>
                  </div>
                </div>

                {/* Stress bar */}
                {score && (
                  <div style={{ marginBottom: '10px' }}>
                    <div
                      style={{
                        height: '5px',
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${score.score}%`,
                          height: '100%',
                          background:
                            score.risk_level === 'critical'
                              ? '#f87171'
                              : score.risk_level === 'high'
                              ? '#f97316'
                              : score.risk_level === 'moderate'
                              ? '#fbbf24'
                              : '#34d399',
                          borderRadius: '3px',
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Joined {formatDate(student.created_at)}
                  </span>
                  {student.nextAppointment && (
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#34d399',
                        background: 'rgba(52,211,153,0.12)',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontWeight: 600,
                      }}
                    >
                      📅 Appt: {formatDate(student.nextAppointment.scheduled_at)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentStatus;