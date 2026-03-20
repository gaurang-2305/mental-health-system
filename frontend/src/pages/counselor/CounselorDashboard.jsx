import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const riskColor = { low:'#34d399', moderate:'#fbbf24', high:'#f97316', critical:'#f87171' };
const riskBg    = { low:'rgba(52,211,153,0.1)', moderate:'rgba(251,191,36,0.1)', high:'rgba(249,115,22,0.1)', critical:'rgba(248,113,113,0.12)' };
const moodColor = s => s>=8?'#34d399':s>=6?'#4f8ef7':s>=4?'#fbbf24':'#f87171';
const fmt       = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—';
const fmtTime   = d => d ? new Date(d).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '—';
const ago       = d => { if(!d)return'—'; const s=Math.floor((Date.now()-new Date(d))/1000); if(s<60)return'just now'; if(s<3600)return`${Math.floor(s/60)}m ago`; if(s<86400)return`${Math.floor(s/3600)}h ago`; return`${Math.floor(s/86400)}d ago`; };

function Pill({ label, color, bg }) {
  return <span style={{ fontSize:11,fontWeight:700,color,background:bg,padding:'2px 10px',borderRadius:20,textTransform:'uppercase',letterSpacing:'0.3px' }}>{label}</span>;
}

function StatCard({ icon, label, value, color='var(--primary)', sub }) {
  return (
    <div style={{ background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'18px 20px' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10 }}>
        <span style={{ fontSize:12,color:'var(--text3)',fontWeight:500 }}>{label}</span>
        <div style={{ width:36,height:36,borderRadius:10,background:`${color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>{icon}</div>
      </div>
      <div style={{ fontSize:'2rem',fontFamily:'var(--font-display)',color,lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11,color:'var(--text3)',marginTop:4 }}>{sub}</div>}
    </div>
  );
}

// ─── Student detail modal ─────────────────────────────────────────────────────
function StudentDetail({ student, onClose }) {
  const [tab, setTab]         = useState('overview');
  const [moods, setMoods]     = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [appts, setAppts]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student?.id) return;
    setLoading(true);
    Promise.all([
      supabase.from('mood_logs').select('*').eq('student_id', student.id).order('logged_at',{ascending:false}).limit(30),
      supabase.from('surveys').select('*').eq('student_id', student.id).order('submitted_at',{ascending:false}).limit(20),
      supabase.from('appointments').select('*').eq('student_id', student.id).order('scheduled_at',{ascending:false}).limit(20),
    ]).then(([m, s, a]) => {
      setMoods(m.data||[]); setSurveys(s.data||[]); setAppts(a.data||[]);
      setLoading(false);
    });
  }, [student?.id]);

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(6px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:18,width:'100%',maxWidth:740,maxHeight:'92vh',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 24px 64px rgba(0,0,0,0.5)' }}>

        {/* Header */}
        <div style={{ padding:'18px 24px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:14,flexShrink:0 }}>
          <div style={{ width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,#4f8ef7,#7c5cbf)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,color:'#fff',flexShrink:0 }}>
            {student.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700,fontSize:17 }}>{student.full_name}</div>
            <div style={{ fontSize:12,color:'var(--text3)' }}>{student.email} · {student.class||'No class'}</div>
          </div>
          {student.latestStress?.risk_level && (
            <Pill label={student.latestStress.risk_level} color={riskColor[student.latestStress.risk_level]} bg={riskBg[student.latestStress.risk_level]} />
          )}
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)',border:'none',borderRadius:8,width:32,height:32,cursor:'pointer',color:'var(--text2)',fontSize:20,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex',gap:0,padding:'0 24px',borderBottom:'1px solid var(--border)',flexShrink:0 }}>
          {[['overview','📊 Overview'],['moods','😊 Mood Logs'],['surveys','📋 Surveys'],['appointments','📅 Appointments']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ padding:'12px 16px',border:'none',borderBottom:tab===k?'2px solid var(--primary)':'2px solid transparent',background:'transparent',color:tab===k?'var(--primary)':'var(--text3)',fontSize:13,fontWeight:tab===k?600:400,cursor:'pointer',marginBottom:-1,whiteSpace:'nowrap' }}>
              {l}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex:1,overflowY:'auto',padding:24 }}>
          {loading ? (
            <div style={{ textAlign:'center',padding:48,color:'var(--text3)' }}>
              <div style={{ width:32,height:32,border:'3px solid rgba(255,255,255,0.1)',borderTopColor:'var(--primary)',borderRadius:'50%',animation:'spin 0.7s linear infinite',margin:'0 auto 12px' }} />
              <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
              Loading student data...
            </div>
          ) : (
            <>
              {/* ─── OVERVIEW ─── */}
              {tab==='overview' && (
                <div>
                  <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20 }}>
                    {[
                      ['Latest Mood', moods[0]?.mood_score ?? '—', moods[0] ? moodColor(moods[0].mood_score) : 'var(--text3)', moods[0] ? ago(moods[0].logged_at) : 'No entries'],
                      ['Surveys Taken', surveys.length, 'var(--primary)', surveys[0] ? fmt(surveys[0].submitted_at) : 'None yet'],
                      ['Appointments', appts.length, '#34d399', `${appts.filter(a=>a.status==='confirmed').length} confirmed`],
                    ].map(([label, val, color, sub]) => (
                      <div key={label} style={{ background:'var(--bg2)',borderRadius:12,padding:'14px 16px',textAlign:'center' }}>
                        <div style={{ fontSize:'1.8rem',fontWeight:700,color,lineHeight:1 }}>{val}</div>
                        <div style={{ fontSize:11,color:'var(--text3)',marginTop:4 }}>{label}</div>
                        <div style={{ fontSize:10,color:'var(--text3)' }}>{sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Latest survey */}
                  {surveys[0] ? (
                    <div style={{ background:'var(--bg2)',borderRadius:12,padding:16,marginBottom:16 }}>
                      <div style={{ fontWeight:600,fontSize:13,marginBottom:12 }}>📋 Latest Survey · {fmt(surveys[0].submitted_at)}</div>
                      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12 }}>
                        {[['😊 Mood',surveys[0].mood_score,'var(--primary)'],['😰 Stress',surveys[0].stress_score,'#f97316'],['😟 Anxiety',surveys[0].anxiety_level,'#fbbf24'],['🌙 Sleep',`${surveys[0].sleep_hours}h`,'#a78bfa']].map(([l,v,c])=>(
                          <div key={l} style={{ textAlign:'center',padding:'10px 8px',background:'var(--bg3)',borderRadius:8 }}>
                            <div style={{ fontWeight:700,fontSize:16,color:c }}>{v}</div>
                            <div style={{ fontSize:10,color:'var(--text3)',marginTop:2 }}>{l}</div>
                          </div>
                        ))}
                      </div>
                      {surveys[0].ai_evaluation && (
                        <div style={{ padding:'10px 12px',background:'rgba(79,142,247,0.08)',border:'1px solid rgba(79,142,247,0.2)',borderRadius:8,fontSize:12,color:'var(--text2)',lineHeight:1.6 }}>
                          🤖 {surveys[0].ai_evaluation}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ background:'var(--bg2)',borderRadius:12,padding:20,textAlign:'center',color:'var(--text3)',fontSize:13 }}>No surveys submitted yet.</div>
                  )}

                  {/* Mood bar chart */}
                  {moods.length > 0 && (
                    <div style={{ background:'var(--bg2)',borderRadius:12,padding:16 }}>
                      <div style={{ fontWeight:600,fontSize:13,marginBottom:12 }}>Recent mood trend ({Math.min(moods.length,14)} entries)</div>
                      <div style={{ display:'flex',alignItems:'flex-end',gap:3,height:64 }}>
                        {moods.slice(0,14).reverse().map((m,i) => (
                          <div key={i} title={`${m.mood_score}/10 · ${fmt(m.logged_at)}`}
                            style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2 }}>
                            <div style={{ width:'100%',height:`${(m.mood_score/10)*60}px`,minHeight:4,background:moodColor(m.mood_score),borderRadius:'3px 3px 0 0',transition:'height 0.3s' }} />
                          </div>
                        ))}
                      </div>
                      <div style={{ display:'flex',justifyContent:'space-between',marginTop:4,fontSize:10,color:'var(--text3)' }}>
                        <span>{fmt(moods.slice(0,14).reverse()[0]?.logged_at)}</span>
                        <span>Latest</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── MOOD LOGS ─── */}
              {tab==='moods' && (
                <div>
                  <div style={{ fontWeight:600,marginBottom:16 }}>Mood History ({moods.length} entries)</div>
                  {moods.length === 0 ? (
                    <div style={{ textAlign:'center',padding:40,color:'var(--text3)',fontSize:13 }}>No mood entries yet.</div>
                  ) : (
                    <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                      {moods.map(m => (
                        <div key={m.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:'var(--bg2)',borderRadius:10 }}>
                          <div style={{ width:40,height:40,borderRadius:10,background:`${moodColor(m.mood_score)}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0 }}>
                            {m.mood_emoji || '😐'}
                          </div>
                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                              <span style={{ fontWeight:700,fontSize:18,color:moodColor(m.mood_score) }}>{m.mood_score}/10</span>
                              {m.notes && <span style={{ fontSize:12,color:'var(--text2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{m.notes}</span>}
                            </div>
                          </div>
                          <div style={{ fontSize:11,color:'var(--text3)',textAlign:'right',flexShrink:0 }}>
                            <div>{fmt(m.logged_at)}</div>
                            <div style={{ color:'var(--text3)' }}>{ago(m.logged_at)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── SURVEYS ─── */}
              {tab==='surveys' && (
                <div>
                  <div style={{ fontWeight:600,marginBottom:16 }}>Survey History ({surveys.length} entries)</div>
                  {surveys.length === 0 ? (
                    <div style={{ textAlign:'center',padding:40,color:'var(--text3)',fontSize:13 }}>No surveys submitted yet.</div>
                  ) : (
                    <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
                      {surveys.map(s => {
                        const risk = s.risk_level || 'low';
                        return (
                          <div key={s.id} style={{ background:'var(--bg2)',borderRadius:12,padding:'14px 16px',border:`1px solid ${riskBg[risk]}` }}>
                            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12 }}>
                              <span style={{ fontSize:12,color:'var(--text3)' }}>{fmtTime(s.submitted_at)}</span>
                              <Pill label={risk} color={riskColor[risk]} bg={riskBg[risk]} />
                            </div>
                            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:s.ai_evaluation?12:0 }}>
                              {[['Mood',s.mood_score,'var(--primary)'],['Stress',s.stress_score,'#f97316'],['Anxiety',s.anxiety_level,'#fbbf24'],['Sleep',`${s.sleep_hours}h`,'#a78bfa']].map(([l,v,c])=>(
                                <div key={l} style={{ textAlign:'center',padding:'8px',background:'var(--bg3)',borderRadius:8 }}>
                                  <div style={{ fontWeight:700,fontSize:15,color:c }}>{v}</div>
                                  <div style={{ fontSize:10,color:'var(--text3)',marginTop:2 }}>{l}</div>
                                </div>
                              ))}
                            </div>
                            {s.ai_evaluation && (
                              <div style={{ padding:'8px 12px',background:'rgba(79,142,247,0.08)',borderRadius:8,fontSize:12,color:'var(--text2)',lineHeight:1.6 }}>
                                🤖 {s.ai_evaluation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ─── APPOINTMENTS ─── */}
              {tab==='appointments' && (
                <div>
                  <div style={{ fontWeight:600,marginBottom:16 }}>Appointment History ({appts.length})</div>
                  {appts.length === 0 ? (
                    <div style={{ textAlign:'center',padding:40,color:'var(--text3)',fontSize:13 }}>No appointments yet.</div>
                  ) : (
                    <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                      {appts.map(a => {
                        const sc = { pending:'#fbbf24',confirmed:'#34d399',cancelled:'#f87171',completed:'var(--text3)' };
                        return (
                          <div key={a.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:'var(--bg2)',borderRadius:10 }}>
                            <span style={{ fontSize:22,flexShrink:0 }}>📅</span>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:13,fontWeight:500 }}>{fmtTime(a.scheduled_at)}</div>
                              {a.notes && <div style={{ fontSize:11,color:'var(--text3)',marginTop:2 }}>{a.notes}</div>}
                            </div>
                            <Pill label={a.status} color={sc[a.status]||'var(--text3)'} bg={`${sc[a.status]||'var(--text3)'}20`} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Counselor Dashboard ─────────────────────────────────────────────────
export default function CounselorDashboard() {
  const { profile } = useAuth();
  const [students, setStudents]   = useState([]);
  const [alerts, setAlerts]       = useState([]);
  const [appointments, setAppts]  = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [search, setSearch]       = useState('');
  const [tab, setTab]             = useState('students');

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchAll() {
    setLoading(true);
    try {
      const [studRes, alertRes, apptRes] = await Promise.all([
        supabase.from('user_profiles').select('id,full_name,email,class,created_at,role_id').eq('role_id',1).order('full_name'),
        supabase.from('crisis_alerts').select('*,student:user_profiles!crisis_alerts_student_id_fkey(full_name,email,class)').eq('is_resolved',false).order('created_at',{ascending:false}),
        supabase.from('appointments').select('*,student:user_profiles!appointments_student_id_fkey(full_name,email)').eq('counselor_id',profile?.id).order('scheduled_at',{ascending:false}).limit(40),
      ]);

      // Enrich students with latest stress score
      const ids = (studRes.data||[]).map(s=>s.id);
      let stressMap = {};
      if (ids.length) {
        const { data: scores } = await supabase.from('stress_scores')
          .select('student_id,score,risk_level,computed_at')
          .in('student_id', ids)
          .order('computed_at',{ascending:false});
        (scores||[]).forEach(s => { if (!stressMap[s.student_id]) stressMap[s.student_id] = s; });
      }

      const enriched = (studRes.data||[]).map(s => ({ ...s, latestStress: stressMap[s.id]||null }));
      const riskOrder = { critical:0,high:1,moderate:2,low:3 };
      enriched.sort((a,b) => {
        const ao = riskOrder[a.latestStress?.risk_level] ?? 4;
        const bo = riskOrder[b.latestStress?.risk_level] ?? 4;
        return ao - bo;
      });

      setStudents(enriched);
      setAlerts(alertRes.data||[]);
      setAppts(apptRes.data||[]);
    } catch(e) { console.error('fetchAll error:', e); }
    finally { setLoading(false); }
  }

  async function resolveAlert(id) {
    await supabase.from('crisis_alerts').update({ is_resolved:true }).eq('id',id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  async function updateAppt(id, status) {
    await supabase.from('appointments').update({ status }).eq('id',id);
    setAppts(prev => prev.map(a => a.id===id ? {...a,status} : a));
  }

  const filtered = students.filter(s =>
    !search || s.full_name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase())
  );
  const pendingAppts  = appointments.filter(a => a.status==='pending');
  const criticalAlerts = alerts.filter(a => a.risk_level==='critical');

  if (loading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'80vh',flexDirection:'column',gap:12 }}>
      <div style={{ width:40,height:40,border:'3px solid rgba(255,255,255,0.1)',borderTopColor:'var(--primary)',borderRadius:'50%',animation:'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      <span style={{ color:'var(--text3)',fontSize:13 }}>Loading counselor dashboard...</span>
    </div>
  );

  return (
    <div style={{ padding:24,maxWidth:1200 }}>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:6 }}>
          <div style={{ width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#34d399,#059669)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>🏥</div>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)',fontSize:'1.5rem',lineHeight:1.2 }}>Counselor Dashboard</h1>
            <p style={{ color:'var(--text2)',fontSize:13 }}>Welcome, {profile?.full_name}. Monitor and support your students.</p>
          </div>
        </div>
      </div>

      {/* Crisis banner */}
      {criticalAlerts.length > 0 && (
        <div style={{ background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.4)',borderRadius:12,padding:'14px 18px',marginBottom:20,display:'flex',alignItems:'center',gap:12 }}>
          <span style={{ fontSize:24,flexShrink:0 }}>🆘</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700,color:'#f87171',fontSize:14 }}>{criticalAlerts.length} Critical Alert{criticalAlerts.length>1?'s':''} — Immediate Attention Required</div>
            <div style={{ fontSize:12,color:'var(--text2)',marginTop:2 }}>{criticalAlerts.map(a=>a.student?.full_name).filter(Boolean).join(', ')}</div>
          </div>
          <button onClick={() => setTab('alerts')}
            style={{ padding:'8px 16px',borderRadius:8,border:'none',background:'#f87171',color:'#fff',cursor:'pointer',fontWeight:600,fontSize:12,flexShrink:0 }}>
            View Alerts
          </button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24 }}>
        <StatCard icon="👥" label="Total Students"       value={students.length}       color="var(--primary)" />
        <StatCard icon="🚨" label="Active Alerts"        value={alerts.length}         color="#f87171"        sub={criticalAlerts.length>0?`${criticalAlerts.length} critical`:undefined} />
        <StatCard icon="⏳" label="Pending Appointments" value={pendingAppts.length}   color="#fbbf24" />
        <StatCard icon="⚠️" label="High/Critical Risk"   value={students.filter(s=>['high','critical'].includes(s.latestStress?.risk_level)).length} color="#f97316" />
      </div>

      {/* Tabs */}
      <div style={{ display:'flex',gap:0,borderBottom:'1px solid var(--border)',marginBottom:20 }}>
        {[['students','👥 Students'],['appointments','📅 Appointments'],['alerts','🚨 Crisis Alerts']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ padding:'10px 18px',border:'none',borderBottom:tab===k?'2px solid var(--primary)':'2px solid transparent',background:'transparent',color:tab===k?'var(--primary)':'var(--text3)',fontWeight:tab===k?600:400,fontSize:13,cursor:'pointer',marginBottom:-1,display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap' }}>
            {l}
            {k==='alerts'&&alerts.length>0&&<span style={{ background:'#f87171',color:'#fff',borderRadius:'50%',width:18,height:18,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700 }}>{alerts.length}</span>}
            {k==='appointments'&&pendingAppts.length>0&&<span style={{ background:'#fbbf24',color:'#000',borderRadius:'50%',width:18,height:18,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700 }}>{pendingAppts.length}</span>}
          </button>
        ))}
      </div>

      {/* ─── STUDENTS TAB ─── */}
      {tab==='students' && (
        <div>
          <div style={{ marginBottom:16 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search students by name or email..."
              style={{ maxWidth:380 }} />
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:14 }}>
            {filtered.map(s => {
              const risk = s.latestStress?.risk_level;
              const isCritical = risk === 'critical';
              const isHigh = risk === 'high';
              return (
                <div key={s.id} onClick={() => setSelected(s)}
                  style={{
                    background:'var(--bg2)',
                    border:`1px solid ${isCritical?'rgba(248,113,113,0.5)':isHigh?'rgba(249,115,22,0.35)':'var(--border)'}`,
                    borderRadius:12,padding:16,cursor:'pointer',transition:'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                      <div style={{ width:40,height:40,borderRadius:'50%',background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#fff',flexShrink:0 }}>
                        {s.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
                      </div>
                      <div>
                        <div style={{ fontWeight:600,fontSize:14 }}>{s.full_name}</div>
                        <div style={{ fontSize:11,color:'var(--text3)' }}>{s.class||'No class'}</div>
                      </div>
                    </div>
                    {risk && <Pill label={risk} color={riskColor[risk]} bg={riskBg[risk]} />}
                  </div>

                  {s.latestStress ? (
                    <>
                      <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--text3)',marginBottom:4 }}>
                        <span>Stress score</span>
                        <span style={{ color:riskColor[risk] }}>{s.latestStress.score}/100</span>
                      </div>
                      <div style={{ height:5,background:'rgba(255,255,255,0.07)',borderRadius:3,overflow:'hidden' }}>
                        <div style={{ width:`${s.latestStress.score}%`,height:'100%',background:riskColor[risk]||'var(--primary)',borderRadius:3 }} />
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize:11,color:'var(--text3)' }}>No stress data yet</div>
                  )}
                  <div style={{ marginTop:8,fontSize:11,color:'var(--primary)',opacity:0.7 }}>Click to view full profile →</div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ gridColumn:'1/-1',textAlign:'center',padding:40,color:'var(--text3)',fontSize:13 }}>
                {search ? 'No students match your search.' : 'No students registered yet.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── APPOINTMENTS TAB ─── */}
      {tab==='appointments' && (
        <div>
          {appointments.length === 0 ? (
            <div style={{ textAlign:'center',padding:60,color:'var(--text3)',fontSize:13 }}>No appointments yet.</div>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {appointments.map(a => {
                const sc = { pending:'#fbbf24',confirmed:'#34d399',cancelled:'#f87171',completed:'var(--text3)' };
                return (
                  <div key={a.id} style={{ background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:'16px 18px',display:'flex',alignItems:'center',gap:14 }}>
                    <span style={{ fontSize:24,flexShrink:0 }}>📅</span>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontWeight:600,fontSize:14 }}>{a.student?.full_name||'Unknown student'}</div>
                      <div style={{ fontSize:12,color:'var(--text3)' }}>{fmtTime(a.scheduled_at)}</div>
                      {a.notes && <div style={{ fontSize:12,color:'var(--text2)',marginTop:2 }}>{a.notes}</div>}
                    </div>
                    <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8,flexShrink:0 }}>
                      <Pill label={a.status} color={sc[a.status]||'var(--text3)'} bg={`${sc[a.status]||'var(--text3)'}20`} />
                      {a.status==='pending' && (
                        <div style={{ display:'flex',gap:6 }}>
                          <button onClick={()=>updateAppt(a.id,'confirmed')} style={{ padding:'5px 12px',borderRadius:8,border:'none',background:'rgba(52,211,153,0.15)',color:'#34d399',cursor:'pointer',fontSize:12,fontWeight:600 }}>✓ Confirm</button>
                          <button onClick={()=>updateAppt(a.id,'cancelled')} style={{ padding:'5px 12px',borderRadius:8,border:'none',background:'rgba(248,113,113,0.12)',color:'#f87171',cursor:'pointer',fontSize:12,fontWeight:600 }}>✕ Cancel</button>
                        </div>
                      )}
                      {a.status==='confirmed' && (
                        <button onClick={()=>updateAppt(a.id,'completed')} style={{ padding:'5px 12px',borderRadius:8,border:'none',background:'rgba(79,142,247,0.15)',color:'var(--primary)',cursor:'pointer',fontSize:12,fontWeight:600 }}>Mark Complete</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── ALERTS TAB ─── */}
      {tab==='alerts' && (
        <div>
          {alerts.length === 0 ? (
            <div style={{ textAlign:'center',padding:60 }}>
              <div style={{ fontSize:52,marginBottom:12 }}>✅</div>
              <div style={{ fontSize:15,fontWeight:600,color:'var(--text2)' }}>No active crisis alerts</div>
              <div style={{ fontSize:13,color:'var(--text3)',marginTop:4 }}>All students are currently safe.</div>
            </div>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              {alerts.map(a => (
                <div key={a.id} style={{ background:riskBg[a.risk_level]||'var(--bg2)',border:`1px solid ${riskColor[a.risk_level]||'var(--border)'}40`,borderRadius:12,padding:'16px 18px',display:'flex',alignItems:'flex-start',gap:14 }}>
                  <span style={{ fontSize:26,flexShrink:0 }}>{a.risk_level==='critical'?'🆘':'⚠️'}</span>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:6,flexWrap:'wrap' }}>
                      <span style={{ fontWeight:700,fontSize:15 }}>{a.student?.full_name||'Unknown'}</span>
                      <Pill label={a.risk_level} color={riskColor[a.risk_level]} bg={riskBg[a.risk_level]} />
                    </div>
                    <div style={{ fontSize:12,color:'var(--text2)',marginBottom:4 }}>📧 {a.student?.email} · {a.student?.class||'—'}</div>
                    {a.trigger_reason && (
                      <div style={{ fontSize:12,color:'var(--text2)',background:'rgba(255,255,255,0.04)',padding:'6px 10px',borderRadius:8,marginBottom:6 }}>
                        📋 {a.trigger_reason}
                      </div>
                    )}
                    <div style={{ fontSize:11,color:'var(--text3)' }}>{ago(a.created_at)}</div>
                  </div>
                  <div style={{ display:'flex',flexDirection:'column',gap:8,flexShrink:0 }}>
                    <button onClick={() => setSelected(students.find(s=>s.id===a.student_id)||{id:a.student_id,full_name:a.student?.full_name,email:a.student?.email,class:a.student?.class})}
                      style={{ padding:'7px 14px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg2)',color:'var(--text)',cursor:'pointer',fontSize:12,fontWeight:600 }}>
                      View Profile
                    </button>
                    <button onClick={() => resolveAlert(a.id)}
                      style={{ padding:'7px 14px',borderRadius:8,border:'none',background:'rgba(52,211,153,0.15)',color:'#34d399',cursor:'pointer',fontSize:12,fontWeight:600 }}>
                      ✓ Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Student detail modal */}
      {selected && <StudentDetail student={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// Backward-compat named exports
export function CrisisAlerts()       { return <CounselorDashboard />; }
export function ManageAppointments() { return <CounselorDashboard />; }
export function StudentStatus()      { return <CounselorDashboard />; }
export function StressReports()      { return <CounselorDashboard />; }