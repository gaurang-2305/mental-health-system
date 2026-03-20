import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const riskColor = { low:'#34d399', moderate:'#fbbf24', high:'#f97316', critical:'#f87171' };
const riskBg    = { low:'rgba(52,211,153,0.1)', moderate:'rgba(251,191,36,0.1)', high:'rgba(249,115,22,0.1)', critical:'rgba(248,113,113,0.12)' };
const ago       = d => { if(!d)return'—'; const s=Math.floor((Date.now()-new Date(d))/1000); if(s<60)return'just now'; if(s<3600)return`${Math.floor(s/60)}m ago`; if(s<86400)return`${Math.floor(s/3600)}h ago`; return`${Math.floor(s/86400)}d ago`; };
const fmt       = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';

export default function CrisisAlerts() {
  const { profile } = useAuth();
  const [alerts, setAlerts]    = useState([]);
  const [students, setStudents]= useState({});   // id → profile
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState('');
  const [filter, setFilter]    = useState('Active'); // All | Active | Resolved

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchData() {
    setLoading(true);
    setError('');
    try {
      // Fetch ALL alerts (we filter client-side) — no FK join
      const { data: alertData, error: alertErr } = await supabase
        .from('crisis_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (alertErr) throw alertErr;

      const alerts = alertData || [];
      setAlerts(alerts);

      // Fetch student profiles separately
      const ids = [...new Set(alerts.map(a => a.student_id).filter(Boolean))];
      if (ids.length > 0) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('id, full_name, email, class, phone')
          .in('id', ids);

        const map = {};
        (profileData || []).forEach(p => { map[p.id] = p; });
        setStudents(map);
      }
    } catch (err) {
      console.error('CrisisAlerts error:', err);
      setError('Failed to load crisis alerts: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  async function resolveAlert(id) {
    const { error: e } = await supabase.from('crisis_alerts').update({ is_resolved: true }).eq('id', id);
    if (e) { alert('Failed to resolve: ' + e.message); return; }
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_resolved: true } : a));
  }

  async function reopenAlert(id) {
    const { error: e } = await supabase.from('crisis_alerts').update({ is_resolved: false }).eq('id', id);
    if (e) { alert('Failed to reopen: ' + e.message); return; }
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_resolved: false } : a));
  }

  const filtered = alerts.filter(a => {
    if (filter === 'Active')   return !a.is_resolved;
    if (filter === 'Resolved') return  a.is_resolved;
    return true;
  });

  const activeCount   = alerts.filter(a => !a.is_resolved).length;
  const criticalCount = alerts.filter(a => !a.is_resolved && a.risk_level === 'critical').length;

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 4 }}>Crisis Alerts</h1>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>Monitor and respond to student mental health emergencies</p>
      </div>

      {/* Critical banner */}
      {criticalCount > 0 && (
        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.4)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>🆘</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#f87171', fontSize: 14 }}>
              {criticalCount} Critical Alert{criticalCount > 1 ? 's' : ''} — Immediate Attention Required
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
              {alerts.filter(a => !a.is_resolved && a.risk_level === 'critical').map(a => students[a.student_id]?.full_name || 'Unknown').join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.4)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ color: '#f87171', fontSize: 13, flex: 1 }}>⚠️ {error}</span>
          <button onClick={() => { setError(''); fetchData(); }} style={{ background: 'none', border: '1px solid rgba(248,113,113,0.4)', borderRadius: 8, color: '#f87171', cursor: 'pointer', padding: '4px 12px', fontSize: 12 }}>Retry</button>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['All', 'Active', 'Resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '7px 18px', borderRadius: 20, border: filter === f ? 'none' : '1px solid var(--border)',
              background: filter === f ? 'var(--primary)' : 'var(--bg2)',
              color: filter === f ? '#fff' : 'var(--text2)',
              cursor: 'pointer', fontSize: 13, fontWeight: filter === f ? 600 : 400,
            }}>
            {f}
            {f === 'Active' && activeCount > 0 && (
              <span style={{ marginLeft: 6, background: '#f87171', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                {activeCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 48, textAlign: 'center', color: 'var(--text3)' }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
          <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          Loading crisis alerts...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>
            No {filter.toLowerCase()} crisis alerts
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>
            {filter === 'Active' ? 'All students are currently safe.' : 'No resolved alerts to show.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(a => {
            const student = students[a.student_id];
            const risk = a.risk_level || 'moderate';
            const resolved = a.is_resolved;
            return (
              <div key={a.id} style={{
                background: resolved ? 'var(--bg2)' : (riskBg[risk] || 'var(--bg2)'),
                border: `1px solid ${resolved ? 'var(--border)' : `${riskColor[risk]}40`}`,
                borderRadius: 12, padding: '16px 18px',
                display: 'flex', alignItems: 'flex-start', gap: 14,
                opacity: resolved ? 0.75 : 1,
              }}>
                <span style={{ fontSize: 26, flexShrink: 0 }}>
                  {resolved ? '✅' : (risk === 'critical' ? '🆘' : '⚠️')}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Student info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{student?.full_name || 'Unknown student'}</span>
                    {!resolved && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: riskColor[risk], background: riskBg[risk], padding: '2px 10px', borderRadius: 20, textTransform: 'uppercase' }}>
                        {risk}
                      </span>
                    )}
                    {resolved && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '2px 10px', borderRadius: 20 }}>
                        Resolved
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>
                    📧 {student?.email || '—'}
                    {student?.class ? ` · ${student.class}` : ''}
                    {student?.phone ? ` · 📞 ${student.phone}` : ''}
                  </div>
                  {a.trigger_reason && (
                    <div style={{ fontSize: 12, color: 'var(--text2)', background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: 8, marginBottom: 6, lineHeight: 1.5 }}>
                      📋 {a.trigger_reason}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {resolved ? '✓ Resolved' : `⏰ ${ago(a.created_at)}`}
                    {a.created_at && ` · ${fmt(a.created_at)}`}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  {!resolved ? (
                    <button onClick={() => resolveAlert(a.id)}
                      style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'rgba(52,211,153,0.15)', color: '#34d399', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      ✓ Resolve
                    </button>
                  ) : (
                    <button onClick={() => reopenAlert(a.id)}
                      style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text2)', cursor: 'pointer', fontSize: 12 }}>
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}