import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

const riskColor = { low:'#34d399', moderate:'#fbbf24', high:'#f97316', critical:'#f87171' };
const riskBg    = { low:'rgba(52,211,153,0.1)', moderate:'rgba(251,191,36,0.1)', high:'rgba(249,115,22,0.1)', critical:'rgba(248,113,113,0.12)' };
const fmt       = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—';

export default function StressReports() {
  const [data, setData]       = useState([]);
  const [students, setStudents]=useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [riskFilter, setRisk] = useState('All');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true); setError('');
    try {
      // Get all students
      const { data: studs, error: se } = await supabase
        .from('user_profiles').select('id,full_name,email,class').eq('role_id',1).order('full_name');
      if (se) throw se;

      const map = {};
      (studs||[]).forEach(s => { map[s.id] = s; });
      setStudents(map);

      const ids = (studs||[]).map(s=>s.id);
      if (!ids.length) { setData([]); setLoading(false); return; }

      // Get latest stress score per student
      const { data: scores, error: scE } = await supabase
        .from('stress_scores')
        .select('student_id,score,risk_level,computed_at')
        .in('student_id', ids)
        .order('computed_at',{ascending:false});
      if (scE) throw scE;

      // Deduplicate — keep latest per student
      const latest = {};
      (scores||[]).forEach(s => { if (!latest[s.student_id]) latest[s.student_id] = s; });

      // Also get survey count per student
      const { data: surveys } = await supabase
        .from('surveys').select('student_id').in('student_id', ids);
      const surveyCount = {};
      (surveys||[]).forEach(s => { surveyCount[s.student_id] = (surveyCount[s.student_id]||0) + 1; });

      // Build report rows — include all students, even those with no data
      const rows = (studs||[]).map(s => ({
        ...s,
        stress:      latest[s.id] || null,
        surveyCount: surveyCount[s.id] || 0,
      }));

      const riskOrder = { critical:0,high:1,moderate:2,low:3 };
      rows.sort((a,b) => (riskOrder[a.stress?.risk_level]??4) - (riskOrder[b.stress?.risk_level]??4));
      setData(rows);
    } catch(err) {
      setError('Failed to load stress reports: '+(err.message||'Unknown error'));
    } finally { setLoading(false); }
  }

  const filtered = data.filter(s =>
    riskFilter==='All' || s.stress?.risk_level===riskFilter.toLowerCase() || (!s.stress && riskFilter==='No Data')
  );

  const counts = {
    total:    data.length,
    critical: data.filter(s=>s.stress?.risk_level==='critical').length,
    high:     data.filter(s=>s.stress?.risk_level==='high').length,
    moderate: data.filter(s=>s.stress?.risk_level==='moderate').length,
    low:      data.filter(s=>s.stress?.risk_level==='low').length,
    noData:   data.filter(s=>!s.stress).length,
  };

  return (
    <div style={{ padding:24 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'var(--font-display)',fontSize:'1.5rem',marginBottom:4 }}>Stress Reports</h1>
        <p style={{ color:'var(--text2)',fontSize:13 }}>Overview of student stress levels across the institution</p>
      </div>

      {error && (
        <div style={{ background:'rgba(248,113,113,0.12)',border:'1px solid rgba(248,113,113,0.4)',borderRadius:10,padding:'12px 16px',marginBottom:20,display:'flex',gap:10,alignItems:'center' }}>
          <span style={{ color:'#f87171',fontSize:13,flex:1 }}>⚠️ {error}</span>
          <button onClick={fetchData} style={{ background:'none',border:'1px solid rgba(248,113,113,0.4)',borderRadius:8,color:'#f87171',cursor:'pointer',padding:'4px 12px',fontSize:12 }}>Retry</button>
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:24 }}>
        {[['Critical',counts.critical,'#f87171'],['High',counts.high,'#f97316'],['Moderate',counts.moderate,'#fbbf24'],['Low',counts.low,'#34d399'],['No Data',counts.noData,'var(--text3)']].map(([label,count,color])=>(
          <div key={label} style={{ background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 16px',textAlign:'center',cursor:'pointer',transition:'all 0.15s' }}
            onClick={() => setRisk(riskFilter===label?'All':label)}>
            <div style={{ fontSize:'1.6rem',fontWeight:700,color,lineHeight:1 }}>{count}</div>
            <div style={{ fontSize:11,color:'var(--text3)',marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display:'flex',gap:6,marginBottom:20,flexWrap:'wrap' }}>
        {['All','Critical','High','Moderate','Low','No Data'].map(r=>(
          <button key={r} onClick={()=>setRisk(r)}
            style={{ padding:'6px 14px',borderRadius:20,border:riskFilter===r?'none':'1px solid var(--border)',background:riskFilter===r?'var(--primary)':'var(--bg2)',color:riskFilter===r?'#fff':'var(--text2)',cursor:'pointer',fontSize:12,fontWeight:riskFilter===r?600:400 }}>
            {r}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center',padding:48,color:'var(--text3)' }}>
          <div style={{ width:32,height:32,border:'3px solid rgba(255,255,255,0.1)',borderTopColor:'var(--primary)',borderRadius:'50%',animation:'spin 0.7s linear infinite',margin:'0 auto 12px' }} />
          <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          Loading stress reports...
        </div>
      ) : (
        <div style={{ background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,overflow:'hidden' }}>
          {/* Table header */}
          <div style={{ display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'10px 18px',borderBottom:'1px solid var(--border)',fontSize:11,fontWeight:600,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.5px' }}>
            <span>Student</span><span style={{ textAlign:'center' }}>Risk Level</span><span style={{ textAlign:'center' }}>Score</span><span style={{ textAlign:'center' }}>Surveys</span><span style={{ textAlign:'center' }}>Last Updated</span>
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding:40,textAlign:'center',color:'var(--text3)',fontSize:13 }}>No students match the selected filter.</div>
          ) : (
            filtered.map((s,i) => {
              const risk = s.stress?.risk_level;
              return (
                <div key={s.id} style={{ display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'13px 18px',borderBottom:i<filtered.length-1?'1px solid var(--border)':'none',alignItems:'center' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                    <div style={{ width:36,height:36,borderRadius:'50%',background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff',flexShrink:0 }}>
                      {s.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
                    </div>
                    <div>
                      <div style={{ fontWeight:600,fontSize:13 }}>{s.full_name}</div>
                      <div style={{ fontSize:11,color:'var(--text3)' }}>{s.class||'—'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    {risk ? (
                      <span style={{ fontSize:10,fontWeight:700,color:riskColor[risk],background:riskBg[risk],padding:'2px 10px',borderRadius:20,textTransform:'uppercase' }}>{risk}</span>
                    ) : <span style={{ color:'var(--text3)',fontSize:12 }}>—</span>}
                  </div>
                  <div style={{ textAlign:'center',fontWeight:700,color:risk?riskColor[risk]:'var(--text3)',fontSize:14 }}>
                    {s.stress ? `${s.stress.score}` : '—'}
                  </div>
                  <div style={{ textAlign:'center',fontSize:13,color:'var(--text2)' }}>{s.surveyCount}</div>
                  <div style={{ textAlign:'center',fontSize:11,color:'var(--text3)' }}>{fmt(s.stress?.computed_at)}</div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}