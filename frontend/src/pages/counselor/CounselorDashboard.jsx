import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllStudents, getCrisisAlerts, resolveCrisisAlert, getAppointments, updateAppointment, getStressScores } from '../../services/dataService';
import { StatCard, Card, Loader, Button, Badge } from '../../components/ui/index.jsx';

export function CounselorDashboard() {
  const { profile } = useAuth();
  const [students, setStudents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    Promise.all([getAllStudents(), getCrisisAlerts(profile.id), getAppointments(profile.id, 'counselor')])
      .then(([s, a, appts]) => { setStudents(s); setAlerts(a); setAppointments(appts); setLoading(false); }).catch(() => setLoading(false));
  }, [profile?.id]);

  async function handleResolveAlert(id) {
    await resolveCrisisAlert(id);
    setAlerts(alerts.filter(a => a.id !== id));
  }

  if (loading) return <Loader />;
  const pendingAppts = appointments.filter(a => a.status === 'pending');
  const today = appointments.filter(a => new Date(a.scheduled_at).toDateString() === new Date().toDateString());

  return (
    <div className="animate-fade">
      <div className="page-header"><h1>🏥 Counselor Dashboard</h1><p>Monitor student mental health and manage your sessions.</p></div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard icon="👥" label="Total Students" value={students.length} color="var(--primary)" />
        <StatCard icon="🚨" label="Active Alerts" value={alerts.length} sub="Needs attention" color="var(--danger)" />
        <StatCard icon="📅" label="Today's Sessions" value={today.length} color="var(--success)" />
        <StatCard icon="⏳" label="Pending Requests" value={pendingAppts.length} color="var(--warning)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card title="🚨 Crisis Alerts">
          {alerts.length === 0 ? <div style={{ color: 'var(--success)', fontSize: 13, padding: '10px 0' }}>✅ No active crisis alerts</div> : (
            alerts.map(a => (
              <div key={a.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{a.student?.full_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{a.student?.class} • {a.student?.email}</div>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: a.risk_level === 'critical' ? 'var(--danger)' : 'var(--danger-bg)', color: a.risk_level === 'critical' ? '#fff' : 'var(--danger)', marginTop: 4 }}>{a.risk_level?.toUpperCase()}</span>
                    {a.trigger_reason && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{a.trigger_reason}</div>}
                  </div>
                  <Button size="sm" variant="success" onClick={() => handleResolveAlert(a.id)}>Resolve</Button>
                </div>
              </div>
            ))
          )}
        </Card>

        <Card title="📅 Upcoming Appointments">
          {pendingAppts.length === 0 ? <div style={{ color: 'var(--text3)', fontSize: 13 }}>No pending appointments</div> : (
            pendingAppts.slice(0, 5).map(a => (
              <div key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{a.student?.full_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(a.scheduled_at).toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button size="sm" variant="success" onClick={async () => { await updateAppointment(a.id, 'confirmed'); setAppointments(appointments.map(ap => ap.id === a.id ? { ...ap, status: 'confirmed' } : ap)); }}>Confirm</Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </Card>

        <Card title="👥 Recent Students" style={{ gridColumn: '1 / -1' }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Class</th><th>Email</th><th>Joined</th></tr></thead>
              <tbody>
                {students.slice(0, 8).map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500 }}>{s.full_name}</td>
                    <td style={{ color: 'var(--text3)' }}>{s.class || '—'}</td>
                    <td style={{ color: 'var(--text3)' }}>{s.email}</td>
                    <td style={{ color: 'var(--text3)', fontSize: 12 }}>{new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function CrisisAlerts() {
  const { profile } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) getCrisisAlerts(profile.id).then(d => { setAlerts(d); setLoading(false); }).catch(() => setLoading(false));
  }, [profile?.id]);

  if (loading) return <Loader />;
  return (
    <div className="animate-fade">
      <div className="page-header"><h1>🚨 Crisis Alerts</h1><p>Students requiring immediate attention.</p></div>
      {alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <h3 style={{ color: 'var(--text2)' }}>No active crisis alerts</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {alerts.map(a => (
            <div key={a.id} style={{ background: 'var(--bg2)', border: `1px solid ${a.risk_level === 'critical' ? 'var(--danger)' : 'var(--warning)'}`, borderRadius: 'var(--radius)', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>{a.risk_level === 'critical' ? '🆘' : '⚠️'}</span>
                    <h3 style={{ margin: 0 }}>{a.student?.full_name}</h3>
                    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: a.risk_level === 'critical' ? 'var(--danger)' : 'var(--warning-bg)', color: a.risk_level === 'critical' ? '#fff' : 'var(--warning)', textTransform: 'uppercase' }}>{a.risk_level}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', display: 'flex', gap: 16 }}>
                    <span>📚 {a.student?.class}</span>
                    <span>📧 {a.student?.email}</span>
                    <span>🕐 {new Date(a.created_at).toLocaleString()}</span>
                  </div>
                  {a.trigger_reason && <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 8, background: 'var(--bg3)', padding: '8px 12px', borderRadius: 8 }}>📋 {a.trigger_reason}</div>}
                </div>
                <Button variant="success" onClick={async () => { await resolveCrisisAlert(a.id); setAlerts(alerts.filter(al => al.id !== a.id)); }}>Mark Resolved</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ManageAppointments() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) getAppointments(profile.id, 'counselor').then(d => { setAppointments(d); setLoading(false); }).catch(() => setLoading(false));
  }, [profile?.id]);

  async function changeStatus(id, status) {
    await updateAppointment(id, status);
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
  }

  const statusColor = { pending: 'var(--warning)', confirmed: 'var(--success)', cancelled: 'var(--danger)', completed: 'var(--text3)' };
  if (loading) return <Loader />;

  return (
    <div className="animate-fade">
      <div className="page-header"><h1>📅 Manage Appointments</h1></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Student</th><th>Date & Time</th><th>Notes</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {appointments.map(a => (
              <tr key={a.id}>
                <td><div style={{ fontWeight: 500 }}>{a.student?.full_name}</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>{a.student?.email}</div></td>
                <td style={{ fontSize: 13 }}>{new Date(a.scheduled_at).toLocaleString()}</td>
                <td style={{ fontSize: 12, color: 'var(--text3)', maxWidth: 200 }}>{a.notes || '—'}</td>
                <td><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, textTransform: 'capitalize', background: `${statusColor[a.status]}18`, color: statusColor[a.status] }}>{a.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {a.status === 'pending' && <><Button size="sm" variant="success" onClick={() => changeStatus(a.id, 'confirmed')}>Confirm</Button><Button size="sm" variant="danger" onClick={() => changeStatus(a.id, 'cancelled')}>Cancel</Button></>}
                    {a.status === 'confirmed' && <Button size="sm" variant="secondary" onClick={() => changeStatus(a.id, 'completed')}>Complete</Button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StudentStatus() { return <CounselorDashboard />; }
export function StressReports() {
  return (
    <div className="animate-fade">
      <div className="page-header"><h1>📈 Stress Reports</h1><p>View aggregated student stress analytics.</p></div>
      <Card><div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Stress reports dashboard — connect to analytics API for real-time data.</div></Card>
    </div>
  );
}

export default CounselorDashboard;