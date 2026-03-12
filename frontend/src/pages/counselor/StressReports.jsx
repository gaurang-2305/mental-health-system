import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import Card from '../../components/ui/Card';
import RiskBadge from '../../components/crisis/RiskBadge';
import StressChart from '../../components/charts/StressChart';
import MoodChart from '../../components/charts/MoodChart';
import { PageLoader } from '../../components/ui/Loader';
import { formatDate, average } from '../../utils/helpers';

const StressReports = () => {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, class_year')
        .eq('role_id', 1)
        .order('full_name');

      // Get latest stress scores for each
      const { data: scores } = await supabase
        .from('stress_scores')
        .select('user_id, score, risk_level, created_at')
        .order('created_at', { ascending: false });

      const scoreMap = {};
      (scores || []).forEach((s) => {
        if (!scoreMap[s.user_id]) scoreMap[s.user_id] = s;
      });

      const enriched = (profiles || []).map((p) => ({
        ...p,
        latestScore: scoreMap[p.id] || null,
      }));

      // Sort by risk level (critical first)
      const riskOrder = { critical: 0, high: 1, moderate: 2, low: 3 };
      enriched.sort((a, b) => {
        const aRisk = riskOrder[a.latestScore?.risk_level] ?? 4;
        const bRisk = riskOrder[b.latestScore?.risk_level] ?? 4;
        return aRisk - bRisk;
      });

      setStudents(enriched);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetail = async (studentId) => {
    setDetailLoading(true);
    try {
      const [
        { data: moods },
        { data: stresses },
        { data: surveys },
      ] = await Promise.all([
        supabase.from('mood_logs').select('*').eq('user_id', studentId).order('created_at', { ascending: false }).limit(14),
        supabase.from('stress_scores').select('*').eq('user_id', studentId).order('created_at', { ascending: false }).limit(14),
        supabase.from('surveys').select('*').eq('user_id', studentId).order('created_at', { ascending: false }).limit(5),
      ]);

      setStudentData({ moods: moods || [], stresses: stresses || [], surveys: surveys || [] });
    } catch (err) {
      console.error('Detail fetch error:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSelect = (student) => {
    setSelected(student);
    fetchStudentDetail(student.id);
  };

  if (loading) return <PageLoader text="Loading stress reports..." />;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Student Stress Reports</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Monitor stress levels across all students
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.5fr' : '1fr', gap: '20px' }}>
        {/* Student list */}
        <Card title={`Students (${students.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '600px', overflowY: 'auto' }}>
            {students.map((student) => (
              <div
                key={student.id}
                onClick={() => handleSelect(student)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background:
                    selected?.id === student.id
                      ? 'rgba(79,142,247,0.15)'
                      : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selected?.id === student.id ? 'rgba(79,142,247,0.4)' : 'var(--border)'}`,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {student.full_name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {student.class_year || 'No class'} · {student.email}
                    </div>
                  </div>
                  {student.latestScore ? (
                    <RiskBadge risk={student.latestScore.risk_level} size="xs" />
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No data</span>
                  )}
                </div>
                {student.latestScore && (
                  <div style={{ marginTop: '6px' }}>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${student.latestScore.score}%`,
                          height: '100%',
                          background:
                            student.latestScore.risk_level === 'critical'
                              ? '#f87171'
                              : student.latestScore.risk_level === 'high'
                              ? '#f97316'
                              : student.latestScore.risk_level === 'moderate'
                              ? '#fbbf24'
                              : '#34d399',
                          borderRadius: '2px',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Score: {student.latestScore.score}/100 · {formatDate(student.latestScore.created_at)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Student detail */}
        {selected && (
          <div>
            <Card title={`${selected.full_name} — Detail`} style={{ marginBottom: '16px' }}>
              {detailLoading ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Loading...
                </div>
              ) : studentData ? (
                <>
                  {/* Summary stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                    {[
                      { label: 'Avg Mood', value: studentData.moods.length ? `${average(studentData.moods.map(m => m.mood_score)).toFixed(1)}/10` : 'N/A', icon: '😊' },
                      { label: 'Avg Stress', value: studentData.stresses.length ? `${Math.round(average(studentData.stresses.map(s => s.score)))}` : 'N/A', icon: '😰' },
                      { label: 'Surveys', value: studentData.surveys.length, icon: '📋' },
                    ].map((stat) => (
                      <div key={stat.label} style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Mood chart */}
                  {studentData.moods.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>Mood (Last 14 days)</div>
                      <MoodChart data={studentData.moods} height={140} />
                    </div>
                  )}

                  {/* Stress chart */}
                  {studentData.stresses.length > 0 && (
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>Stress Scores</div>
                      <StressChart data={studentData.stresses} height={140} />
                    </div>
                  )}
                </>
              ) : null}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default StressReports;