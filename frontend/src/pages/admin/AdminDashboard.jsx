import React, { useState, useEffect } from 'react';
import { getSystemStats, getAllStudents, getAllCrisisAlerts } from '../../services/dataService';
import { StatCard, Card, Loader, Button, Badge } from '../../components/ui/index.jsx';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSystemStats().then(s => { setStats(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  return (
    <div className="animate-fade">
      <div className="page-header"><h1>⚙️ Admin Dashboard</h1><p>System overview and management.</p></div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard icon="👥" label="Total Students" value={stats?.totalStudents || 0} color="var(--primary)" />
        <StatCard icon="📋" label="Total Surveys" value={stats?.totalSurveys || 0} color="var(--info)" />
        <StatCard icon="📅" label="Appointments" value={stats?.totalAppointments || 0} color="var(--success)" />
        <StatCard icon="🚨" label="Active Alerts" value={stats?.activeAlerts || 0} sub="Unresolved" color="var(--danger)" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card title="Quick Actions">
          {[
            { label: '👥 Manage Users & Roles', href: '/admin/users' },
            { label: '📊 View Analytics', href: '/admin/analytics' },
            { label: '🚨 Crisis Alerts', href: '/admin/alerts' },
            { label: '📤 Export Reports', href: '/admin/export' },
            { label: '💾 Backup & Recovery', href: '/admin/backup' },
          ].map(a => (
            <a key={a.href} href={a.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderRadius: 8, background: 'var(--bg3)', color: 'var(--text)', textDecoration: 'none', marginBottom: 8, fontSize: 13, transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}>
              {a.label} <span style={{ color: 'var(--text3)' }}>→</span>
            </a>
          ))}
        </Card>
        <Card title="System Status">
          {[
            { label: 'Database', status: 'Online', ok: true },
            { label: 'AI Service', status: 'Online', ok: true },
            { label: 'Authentication', status: 'Online', ok: true },
            { label: 'Notifications', status: 'Online', ok: true },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span>{s.label}</span>
              <span style={{ color: s.ok ? 'var(--success)' : 'var(--danger)', fontSize: 12, fontWeight: 600 }}>● {s.status}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

export function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllStudents().then(d => { setUsers(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Loader />;
  return (
    <div className="animate-fade">
      <div className="page-header"><h1>👥 Manage Users</h1><p>View and manage all registered users.</p></div>
      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ maxWidth: 360 }} />
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Class</th><th>Age</th><th>Joined</th><th>Role</th></tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td><div style={{ fontWeight: 500 }}>{u.full_name}</div></td>
                <td style={{ fontSize: 13, color: 'var(--text3)' }}>{u.email}</td>
                <td style={{ fontSize: 13 }}>{u.class || '—'}</td>
                <td style={{ fontSize: 13 }}>{u.age || '—'}</td>
                <td style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td><span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, background: 'var(--primary-glow)', color: 'var(--primary)', textTransform: 'capitalize' }}>{u.roles?.name || 'student'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getSystemStats().then(s => { setStats(s); setLoading(false); }).catch(() => setLoading(false)); }, []);
  if (loading) return <Loader />;
  return (
    <div className="animate-fade">
      <div className="page-header"><h1>📊 Analytics Dashboard</h1></div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard icon="👥" label="Students" value={stats?.totalStudents} color="var(--primary)" />
        <StatCard icon="📋" label="Surveys" value={stats?.totalSurveys} color="var(--info)" />
        <StatCard icon="📅" label="Appointments" value={stats?.totalAppointments} color="var(--success)" />
        <StatCard icon="🚨" label="Alerts" value={stats?.activeAlerts} color="var(--danger)" />
      </div>
      <Card title="Platform Insights">
        <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7 }}>
          Connect to your Supabase dashboard for detailed analytics including mood trends, survey completion rates, counselor engagement metrics, and more real-time insights.
        </p>
      </Card>
    </div>
  );
}

export function AdminCrisisAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getAllCrisisAlerts().then(d => { setAlerts(d); setLoading(false); }).catch(() => setLoading(false)); }, []);
  if (loading) return <Loader />;
  return (
    <div className="animate-fade">
      <div className="page-header"><h1>🚨 All Crisis Alerts</h1></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Student</th><th>Risk Level</th><th>Counselor</th><th>Time</th><th>Status</th></tr></thead>
          <tbody>
            {alerts.map(a => (
              <tr key={a.id}>
                <td><div style={{ fontWeight: 500 }}>{a.student?.full_name}</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>{a.student?.email}</div></td>
                <td><span className={`risk-badge risk-${a.risk_level}`}>{a.risk_level}</span></td>
                <td style={{ fontSize: 13 }}>{a.counselor?.full_name || '—'}</td>
                <td style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(a.created_at).toLocaleString()}</td>
                <td><span style={{ fontSize: 12, color: a.is_resolved ? 'var(--success)' : 'var(--danger)' }}>{a.is_resolved ? '✅ Resolved' : '🔴 Active'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ExportReports() {
  return (
    <div className="animate-fade">
      <div className="page-header"><h1>📤 Export Reports</h1></div>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {['Student Mental Health Summary', 'Crisis Alerts Report', 'Appointment History', 'Survey Analytics'].map(r => (
            <div key={r} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--bg3)', borderRadius: 10 }}>
              <span style={{ fontSize: 14 }}>📄 {r}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="sm" variant="secondary">Export PDF</Button>
                <Button size="sm" variant="secondary">Export Excel</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function BackupRecovery() {
  const [lastBackup] = useState(new Date().toLocaleString());
  return (
    <div className="animate-fade">
      <div className="page-header"><h1>💾 Backup & Recovery</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card title="Create Backup">
          <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 16 }}>Last backup: {lastBackup}</p>
          <Button>Create Backup Now</Button>
        </Card>
        <Card title="Restore">
          <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 16 }}>Restore from a previous backup point.</p>
          <Button variant="danger">Restore Backup</Button>
        </Card>
      </div>
    </div>
  );
}

export function SystemMonitoring() {
  return (
    <div className="animate-fade">
      <div className="page-header"><h1>🖥️ System Monitoring</h1></div>
      <div className="grid-4">
        {[{ icon: '💾', label: 'DB Status', value: 'Online', color: 'var(--success)' }, { icon: '🚀', label: 'API Status', value: 'Online', color: 'var(--success)' }, { icon: '⚡', label: 'Response', value: '<100ms', color: 'var(--info)' }, { icon: '📈', label: 'Uptime', value: '99.9%', color: 'var(--success)' }].map(s => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} />
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;