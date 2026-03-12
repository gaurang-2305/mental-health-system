import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Loader';
import { formatDateTime, getRelativeTime } from '../../utils/helpers';
import { useNotification } from '../../context/NotificationContext';

const STATUS_VARIANTS = {
  pending: 'warning',
  confirmed: 'success',
  completed: 'primary',
  cancelled: 'danger',
};

const ManageAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const { success, error: notify } = useNotification();

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('appointments')
        .select('*, user_profiles!appointments_student_id_fkey(full_name, email, phone, class_year)')
        .order('scheduled_at', { ascending: true });

      if (filter !== 'all') query = query.eq('status', filter);

      const { data, error } = await query;
      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      notify('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      success(`Appointment ${status}`);
      fetchAppointments();
    } catch (err) {
      notify('Failed to update appointment');
    }
  };

  if (loading) return <PageLoader text="Loading appointments..." />;

  const filters = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Manage Appointments</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} {filter !== 'all' ? `(${filter})` : ''}
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              background: filter === f ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
              color: filter === f ? '#fff' : 'var(--text-secondary)',
              textTransform: 'capitalize',
              transition: 'all 0.15s',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <Card>
        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
            📅 No {filter !== 'all' ? filter : ''} appointments found
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Student', 'Scheduled', 'Status', 'Notes', 'Actions'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        borderBottom: '1px solid var(--border)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {appt.user_profiles?.full_name || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {appt.user_profiles?.email}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        {formatDateTime(appt.scheduled_at)}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {getRelativeTime(appt.scheduled_at)}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Badge variant={STATUS_VARIANTS[appt.status] || 'default'}>
                        {appt.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                      {appt.notes || '—'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {appt.status === 'pending' && (
                          <>
                            <Button size="xs" variant="success" onClick={() => updateStatus(appt.id, 'confirmed')}>
                              Confirm
                            </Button>
                            <Button size="xs" variant="danger" onClick={() => updateStatus(appt.id, 'cancelled')}>
                              Cancel
                            </Button>
                          </>
                        )}
                        {appt.status === 'confirmed' && (
                          <Button size="xs" onClick={() => updateStatus(appt.id, 'completed')}>
                            Complete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ManageAppointments;