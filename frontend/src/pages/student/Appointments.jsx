import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookAppointment, getAppointments, getAllCounselors } from '../../services/dataService';
import { Button, Card, Loader, Modal, Select, Alert, Badge } from '../../components/ui/index.jsx';

const statusColor = { pending: 'var(--warning)', confirmed: 'var(--success)', cancelled: 'var(--danger)', completed: 'var(--text3)' };

export default function Appointments() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ counselor_id: '', scheduled_at: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile?.id) {
      Promise.all([
        getAppointments(profile.id, 'student'),
        getAllCounselors(),
      ]).then(([appts, counsels]) => {
        setAppointments(appts); setCounselors(counsels); setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [profile?.id]);

  async function handleBook() {
    if (!form.counselor_id || !form.scheduled_at) return setError('Please fill all required fields');
    setSaving(true); setError('');
    try {
      const appt = await bookAppointment(profile.id, form.counselor_id, form.scheduled_at, form.notes);
      setAppointments([appt, ...appointments]);
      setShowModal(false); setForm({ counselor_id: '', scheduled_at: '', notes: '' });
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  if (loading) return <Loader />;

  const upcoming = appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled');
  const past = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1>📅 Appointments</h1>
          <p>Schedule sessions with counselors for personalized support.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Book Appointment</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Card title="Upcoming Appointments">
          {upcoming.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)', fontSize: 13 }}>
              No upcoming appointments. <button onClick={() => setShowModal(true)} style={{ color: 'var(--primary)', background: 'none', cursor: 'pointer', fontSize: 13 }}>Book one now →</button>
            </div>
          ) : upcoming.map(a => (
            <div key={a.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Dr. {a.counselor?.full_name || 'Counselor'}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>
                    📅 {new Date(a.scheduled_at).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>🕐 {new Date(a.scheduled_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</div>
                  {a.notes && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>📝 {a.notes}</div>}
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: 'capitalize', background: `${statusColor[a.status]}18`, color: statusColor[a.status] }}>{a.status}</span>
              </div>
            </div>
          ))}
        </Card>

        <Card title="Past Appointments">
          {past.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)', fontSize: 13 }}>No past appointments</div>
          ) : past.map(a => (
            <div key={a.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', opacity: 0.7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{a.counselor?.full_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(a.scheduled_at).toLocaleDateString()}</div>
                </div>
                <span style={{ fontSize: 11, color: statusColor[a.status], textTransform: 'capitalize' }}>{a.status}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Book Counselor Appointment"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleBook} loading={saving}>Confirm Booking</Button></>}>
        <Alert message={error} type="error" onClose={() => setError('')} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Select Counselor *</label>
            <select value={form.counselor_id} onChange={e => setForm({ ...form, counselor_id: e.target.value })}>
              <option value="">Choose a counselor...</option>
              {counselors.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date & Time *</label>
            <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm({ ...form, scheduled_at: e.target.value })} min={new Date().toISOString().slice(0, 16)} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="What would you like to discuss?" rows={3} />
          </div>
        </div>
      </Modal>
    </div>
  );
}