import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import Card, { StatCard } from '../../components/ui/Card';
import MoodChart from '../../components/charts/MoodChart';
import StressChart from '../../components/charts/StressChart';
import { PageLoader } from '../../components/ui/Loader';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [moodData, setMoodData] = useState([]);
  const [stressData, setStressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const since = new Date();
      since.setDate(since.getDate() - period);
      const sinceStr = since.toISOString();

      const [
        { count: totalStudents },
        { count: totalSurveys },
        { count: crisisAlerts },
        { count: appointments },
        { data: moods },
        { data: stresses },
      ] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('role_id', 1),
        supabase.from('surveys').select('id', { count: 'exact', head: true }).gte('created_at', sinceStr),
        supabase.from('crisis_alerts').select('id', { count: 'exact', head: true }).gte('created_at', sinceStr),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).gte('created_at', sinceStr),
        supabase.from('mood_logs').select('mood_score, created_at').gte('created_at', sinceStr).order('created_at'),
        supabase.from('stress_scores').select('score, risk_level, created_at').gte('created_at', sinceStr).order('created_at'),
      ]);

      setStats({ totalStudents, totalSurveys, crisisAlerts, appointments });
      setMoodData(moods || []);
      setStressData(stresses || []);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const riskCounts = stressData.reduce((acc, s) => {
    acc[s.risk_level] = (acc[s.risk_level] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <PageLoader text="Loading analytics..." />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Platform-wide mental health insights</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            padding: '8px 12px',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total Students" value={stats?.totalStudents || 0} icon="👥" color="#4f8ef7" />
        <StatCard label="Surveys Completed" value={stats?.totalSurveys || 0} icon="📋" color="#34d399" />
        <StatCard label="Crisis Alerts" value={stats?.crisisAlerts || 0} icon="🚨" color="#f87171" />
        <StatCard label="Appointments" value={stats?.appointments || 0} icon="📅" color="#a78bfa" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <Card title="Mood Trends" subtitle={`Last ${period} days — all students`}>
          <MoodChart data={moodData} height={180} />
        </Card>
        <Card title="Stress Score Trends" subtitle={`Last ${period} days — all students`}>
          <StressChart data={stressData} height={180} />
        </Card>
      </div>

      {/* Risk distribution */}
      <Card title="Risk Level Distribution" subtitle={`Based on ${stressData.length} survey results`}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { level: 'low', color: '#34d399', label: 'Low Risk' },
            { level: 'moderate', color: '#fbbf24', label: 'Moderate' },
            { level: 'high', color: '#f97316', label: 'High Risk' },
            { level: 'critical', color: '#f87171', label: 'Critical' },
          ].map((r) => {
            const count = riskCounts[r.level] || 0;
            const pct = stressData.length ? Math.round((count / stressData.length) * 100) : 0;
            return (
              <div
                key={r.level}
                style={{
                  background: `${r.color}11`,
                  border: `1px solid ${r.color}33`,
                  borderRadius: '10px',
                  padding: '14px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '24px', fontWeight: 700, color: r.color }}>{count}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{r.label}</div>
                <div style={{ fontSize: '13px', color: r.color, fontWeight: 600 }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Analytics;