import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import Card, { StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const StatusDot = ({ status }) => {
  const colors = { online: '#34d399', degraded: '#fbbf24', offline: '#f87171' };
  return (
    <span
      style={{
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: colors[status] || colors.offline,
        marginRight: '6px',
        animation: status === 'online' ? 'pulse 2s infinite' : 'none',
      }}
    />
  );
};

const SystemMonitoring = () => {
  const [services, setServices] = useState([
    { name: 'Supabase Database', status: 'checking', latency: null },
    { name: 'Supabase Auth', status: 'checking', latency: null },
    { name: 'AI Backend (Express)', status: 'checking', latency: null },
    { name: 'Anthropic API', status: 'checking', latency: null },
  ]);
  const [dbStats, setDbStats] = useState(null);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    checkServices();
    fetchDbStats();
  }, []);

  const checkServices = async () => {
    setChecking(true);
    const updatedServices = [...services];

    // Check Supabase DB
    try {
      const start = Date.now();
      await supabase.from('user_profiles').select('id', { head: true, count: 'exact' });
      updatedServices[0] = { ...updatedServices[0], status: 'online', latency: Date.now() - start };
    } catch {
      updatedServices[0] = { ...updatedServices[0], status: 'offline', latency: null };
    }

    // Check Supabase Auth
    try {
      const start = Date.now();
      await supabase.auth.getSession();
      updatedServices[1] = { ...updatedServices[1], status: 'online', latency: Date.now() - start };
    } catch {
      updatedServices[1] = { ...updatedServices[1], status: 'offline', latency: null };
    }

    // Check backend API
    try {
      const start = Date.now();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl.replace('/api', '')}/health`, { signal: AbortSignal.timeout(3000) });
      updatedServices[2] = {
        ...updatedServices[2],
        status: res.ok ? 'online' : 'degraded',
        latency: Date.now() - start,
      };
    } catch {
      updatedServices[2] = { ...updatedServices[2], status: 'offline', latency: null };
    }

    // Anthropic API check (via backend)
    updatedServices[3] = { ...updatedServices[3], status: 'unknown', latency: null };

    setServices(updatedServices);
    setLastChecked(new Date());
    setChecking(false);
  };

  const fetchDbStats = async () => {
    try {
      const [
        { count: users },
        { count: moods },
        { count: surveys },
        { count: alerts },
      ] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('mood_logs').select('id', { count: 'exact', head: true }),
        supabase.from('surveys').select('id', { count: 'exact', head: true }),
        supabase.from('crisis_alerts').select('id', { count: 'exact', head: true }),
      ]);
      setDbStats({ users, moods, surveys, alerts });
    } catch (err) {
      console.error('DB stats error:', err);
    }
  };

  const onlineCount = services.filter((s) => s.status === 'online').length;
  const overallStatus = onlineCount === services.length ? 'online' : onlineCount === 0 ? 'offline' : 'degraded';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>System Monitoring</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {lastChecked ? `Last checked: ${lastChecked.toLocaleTimeString()}` : 'Checking services...'}
          </p>
        </div>
        <Button onClick={checkServices} loading={checking} variant="secondary" icon="🔄">
          Refresh
        </Button>
      </div>

      {/* Overall status */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: '12px',
          background:
            overallStatus === 'online'
              ? 'rgba(52,211,153,0.1)'
              : overallStatus === 'degraded'
              ? 'rgba(251,191,36,0.1)'
              : 'rgba(248,113,113,0.1)',
          border: `1px solid ${
            overallStatus === 'online' ? '#34d39944' : overallStatus === 'degraded' ? '#fbbf2444' : '#f8717144'
          }`,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <span style={{ fontSize: '24px' }}>
          {overallStatus === 'online' ? '✅' : overallStatus === 'degraded' ? '⚠️' : '❌'}
        </span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px' }}>
            System Status:{' '}
            <span style={{ textTransform: 'capitalize', color: overallStatus === 'online' ? '#34d399' : overallStatus === 'degraded' ? '#fbbf24' : '#f87171' }}>
              {overallStatus}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {onlineCount} of {services.length} services operational
          </div>
        </div>
      </div>

      {/* Service status */}
      <Card title="Service Health" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {services.map((svc) => (
            <div
              key={svc.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '10px',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <StatusDot status={svc.status} />
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {svc.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {svc.latency && (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {svc.latency}ms
                  </span>
                )}
                <Badge
                  variant={
                    svc.status === 'online' ? 'success' : svc.status === 'degraded' ? 'warning' : svc.status === 'checking' ? 'default' : 'danger'
                  }
                >
                  {svc.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* DB Stats */}
      {dbStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <StatCard label="Total Users" value={dbStats.users || 0} icon="👥" color="#4f8ef7" />
          <StatCard label="Mood Entries" value={dbStats.moods || 0} icon="😊" color="#34d399" />
          <StatCard label="Surveys" value={dbStats.surveys || 0} icon="📋" color="#a78bfa" />
          <StatCard label="Crisis Alerts" value={dbStats.alerts || 0} icon="🚨" color="#f87171" />
        </div>
      )}
    </div>
  );
};

export default SystemMonitoring;