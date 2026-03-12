import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import RiskBadge from '../../components/crisis/RiskBadge';
import { PageLoader } from '../../components/ui/Loader';
import { formatDateTime, getRelativeTime } from '../../utils/helpers';
import Modal from '../../components/ui/Modal';
import { useNotification } from '../../context/NotificationContext';

const CrisisAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [selected, setSelected] = useState(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolving, setResolving] = useState(false);
  const { success, error: notify } = useNotification();

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('crisis_alerts')
        .select('*, user_profiles(full_name, email, phone, class_year)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter === 'active') query = query.eq('resolved', false);
      else if (filter === 'resolved') query = query.eq('resolved', true);

      const { data, error } = await query;
      if (error) throw error;
      setAlerts(data || []);
    } catch (err) {
      notify('Failed to load crisis alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selected) return;
    setResolving(true);
    try {
      const { error } = await supabase
        .from('crisis_alerts')
        .update({ resolved: true, resolved_at: new Date().toISOString(), notes: resolveNotes })
        .eq('id', selected.id);

      if (error) throw error;
      success('Alert marked as resolved');
      setResolveOpen(false);
      setResolveNotes('');
      fetchAlerts();
    } catch (err) {
      notify('Failed to resolve alert');
    } finally {
      setResolving(false);
    }
  };

  if (loading) return <PageLoader text="Loading crisis alerts..." />;

  const criticalAlerts = alerts.filter((a) => a.risk_level === 'critical' && !a.resolved);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Crisis Alerts</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Monitor and respond to student mental health emergencies
        </p>
      </div>

      {/* Critical alerts banner */}
      {criticalAlerts.length > 0 && (
        <div
          style={{
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.4)',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '22px' }}>🚨</span>
          <div>
            <div style={{ fontWeight: 700, color: '#f87171', fontSize: '14px' }}>
              {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''} Require Immediate Attention
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Please contact these students immediately
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['all', 'active', 'resolved'].map((f) => (
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

      {/* Alerts list */}
      <Card>
        {alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
            ✅ No {filter !== 'all' ? filter : ''} crisis alerts found
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '10px',
                  border: `1px solid ${alert.resolved ? 'var(--border)' : alert.risk_level === 'critical' ? 'rgba(248,113,113,0.3)' : 'rgba(249,115,22,0.3)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        👤 {alert.user_profiles?.full_name || 'Unknown Student'}
                      </span>
                      <RiskBadge risk={alert.risk_level} size="sm" />
                      {alert.resolved && (
                        <span style={{ fontSize: '11px', color: '#34d399', background: 'rgba(52,211,153,0.15)', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                          ✓ Resolved
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      {alert.user_profiles?.email} {alert.user_profiles?.phone ? `· 📞 ${alert.user_profiles.phone}` : ''}
                    </div>
                    {alert.notes && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        📝 {alert.notes}
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      🕐 {getRelativeTime(alert.created_at)} · {formatDateTime(alert.created_at)}
                    </div>
                  </div>
                  {!alert.resolved && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => { setSelected(alert); setResolveOpen(true); }}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Resolve modal */}
      <Modal
        isOpen={resolveOpen}
        onClose={() => setResolveOpen(false)}
        title="Resolve Crisis Alert"
        footer={
          <>
            <Button variant="secondary" onClick={() => setResolveOpen(false)}>Cancel</Button>
            <Button onClick={handleResolve} loading={resolving}>Mark Resolved</Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
          Confirm that you have contacted and provided support to <strong style={{ color: 'var(--text-primary)' }}>{selected?.user_profiles?.full_name}</strong>.
        </p>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Resolution Notes (optional)
        </label>
        <textarea
          value={resolveNotes}
          onChange={(e) => setResolveNotes(e.target.value)}
          placeholder="Describe the action taken..."
          rows={4}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.05)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      </Modal>
    </div>
  );
};

export default CrisisAlerts;