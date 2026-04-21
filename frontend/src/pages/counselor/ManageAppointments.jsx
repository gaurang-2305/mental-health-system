import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const STATUS_TABS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];
const statusColor = { pending:'#fbbf24', confirmed:'#34d399', cancelled:'#f87171', completed:'var(--text3)' };

const fmtTime = d => d ? new Date(d).toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';
const ago     = d => { if(!d)return'—'; const s=Math.floor((Date.now()-new Date(d))/1000); if(s<86400)return`${Math.floor(s/3600)}h ago`; return`${Math.floor(s/86400)}d ago`; };

export default function ManageAppointments() {
  const { profile } = useAuth();
  const [appointments, setAppts] = useState([]);
  const [students, setStudents]  = useState({});
  const [loading, setLoading]    = useState(true);
  const [error, setError]        = useState('');
  const [activeTab, setActiveTab]= useState('Pending');

  useEffect(() => {
    if (profile?.id) fetchData();
  }, [profile?.id]);

  async function fetchData() {
    setLoading(true);
    setError('');
    try {
      const { data: apptData, error: apptErr } = await supabase
        .from('appointments')
        .select('*')
        .eq('counselor_id', profile.id)
        .order('scheduled_at', { ascending: false });

      if (apptErr) throw apptErr;

      const appts = apptData || [];
      setAppts(appts);

      const studentIds = [...new Set(appts.map(a => a.student_id).filter(Boolean))];
      if (studentIds.length > 0) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('id, full_name, email, class')
          .in('id', studentIds);

        const map = {};
        (profileData || []).forEach(p => { map[p.id] = p; });
        setStudents(map);
      }
    } catch (err) {
      console.error('ManageAppointments error:', err);
      setError('Failed to load appointments: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    const { error: e } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (e) { alert('Failed to update: ' + e.message); return; }
    setAppts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }

  const filtered = appointments.filter(a =>
    activeTab === 'All' || a.status?.toLowerCase() === activeTab.toLowerCase()
  );

  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 4 }}>
          Manage Appointments
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>
          {pendingCount} appointment{pendingCount !== 1 ? 's' : ''} (pending)
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(248,113,113,0.12)',
          border: '1px solid rgba(248,113,113,0.4)',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          gap: 10,
          alignItems: 'center'
        }}>
          <span style={{ color: '#f87171', fontSize: 13, flex: 1 }}>
            ⚠️ {error}
          </span>
          <button
            onClick={() => { setError(''); fetchData(); }}
            style={{
              background: 'none',
              border: '1px solid rgba(248,113,113,0.4)',
              borderRadius: 8,
              color: '#f87171',
              cursor: 'pointer',
              padding: '4px 12px',
              fontSize: 12
            }}>
            Retry
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: activeTab === tab ? 600 : 400,
              background: activeTab === tab ? 'var(--primary)' : 'var(--bg2)',
              color: activeTab === tab ? '#fff' : 'var(--text2)',
              border: activeTab === tab ? 'none' : '1px solid var(--border)', // ✅ fixed
            }}>
            {tab}
            {tab === 'Pending' && pendingCount > 0 && (
              <span style={{
                marginLeft: 6,
                background: '#fbbf24',
                color: '#000',
                borderRadius: '50%',
                width: 18,
                height: 18,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700
              }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text3)' }}>
            <div style={{
              width: 32,
              height: 32,
              border: '3px solid rgba(255,255,255,0.1)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
              margin: '0 auto 12px'
            }} />
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
            Loading appointments...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
            No {activeTab.toLowerCase()} appointments found
          </div>
        ) : (
          <div>
            {filtered.map((a, i) => {
              const student = students[a.student_id];
              const sc = statusColor[a.status] || 'var(--text3)';
              return (
                <div key={a.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '16px 20px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#fff',
                    flexShrink: 0
                  }}>
                    {student?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {student?.full_name || 'Unknown student'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                      {student?.email} {student?.class ? `· ${student.class}` : ''}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
                      📅 {fmtTime(a.scheduled_at)}
                      {a.notes && <span style={{ marginLeft: 8, color: 'var(--text3)' }}>· {a.notes}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: sc,
                      background: `${sc}20`,
                      padding: '3px 10px',
                      borderRadius: 20,
                      textTransform: 'capitalize'
                    }}>
                      {a.status}
                    </span>

                    {a.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => updateStatus(a.id, 'confirmed')}>
                          ✓ Confirm
                        </button>
                        <button onClick={() => updateStatus(a.id, 'cancelled')}>
                          ✕ Cancel
                        </button>
                      </div>
                    )}

                    {a.status === 'confirmed' && (
                      <button onClick={() => updateStatus(a.id, 'completed')}>
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}