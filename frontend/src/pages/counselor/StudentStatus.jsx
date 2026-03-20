import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

const riskColor = { low:'#34d399', moderate:'#fbbf24', high:'#f97316', critical:'#f87171' };
const riskBg    = { low:'rgba(52,211,153,0.1)', moderate:'rgba(251,191,36,0.1)', high:'rgba(249,115,22,0.1)', critical:'rgba(248,113,113,0.12)' };
const moodColor = s => s>=8?'#34d399':s>=6?'#4f8ef7':s>=4?'#fbbf24':'#f87171';
const fmt       = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : '—';

export default function StudentStatus() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [riskFilter, setRisk]   = useState('All');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true); setError('');
    try {
      // Fetch students
      const { data: studData, error: se } = await supabase
        .from('user_profiles').select('id,full_name,email,class,created_at').eq('role_id',1).order('full_name');
      if (se) throw se;

      const ids = (studData||[]).map(s=>s.id);
      if (!ids.length) { setStudents([]); setLoading(false); return; }

      // Fetch latest stress + mood in parallel
      const [{ data: stressData }, { data: moodData }] = await Promise.all([
        supabase.from('stress_scores').select('student_id,score,risk_level,computed_at').in('student_id',ids).order('computed_at',{ascending:false}),
        supabase.from('mood_logs').select('student_id,mood_score,logged_at').in('student_id',ids).order('logged_at',{ascending:false}),
      ]);

      const stressMap={}, moodMap={};
      (stressData||[]).forEach(s=>{ if(!stressMap[s.student_id]) stressMap[s.student_id]=s; });
      (moodData||[]).forEach(m=>{ if(!moodMap[m.student_id]) moodMap[m.student_id]=m; });

      const riskOrder={critical:0,high:1,moderate:2,low:3};
      const enriched = (studData||[]).map(s=>({
        ...s,
        stress: stressMap[s.id]||null,
        mood:   moodMap[s.id]||null,
      })).sort((a,b)=>(riskOrder[a.stress?.risk_level]??4)-(riskOrder[b.stress?.risk_level]??4));

      setStudents(enriched);
    } catch(err) {
      setError('Failed to load students: '+(err.message||'Unknown error'));
    } finally { setLoading(false); }
  }

  const filtered = students.filter(s => {
    const matchSearch = !search || s.full_name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase());
    const matchRisk   = riskFilter==='All' || s.stress?.risk_level===riskFilter.toLowerCase() || (!s.stress && riskFilter==='None');
    return matchSearch && matchRisk;
  });

  return (
    <div style={{ padding:24 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'var(--font-display)',fontSize:'1.5rem',marginBottom:4 }}>Student Status</h1>
        <p style={{ color:'var(--text2)',fontSize:13 }}>{students.length} students · sorted by risk level</p>
      </div>

      {error && (
        <div style={{ background:'rgba(248,113,113,0.12)',border:'1px solid rgba(248,113,113,0.4)',borderRadius:10,padding:'12px 16px',marginBottom:20,display:'flex',gap:10,alignItems:'center' }}>
          <span style={{ color:'#f87171',fontSize:13,flex:1 }}>⚠️ {error}</span>
          <button onClick={fetchData} style={{ background:'none',border:'1px solid rgba(248,113,113,0.4)',borderRadius:8,color:'#f87171',cursor:'pointer',padding:'4px 12px',fontSize:12 }}>Retry</button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'flex',gap:10,marginBottom:20,flexWrap:'wrap',alignItems:'center' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search students..."
          style={{ maxWidth:280 }} />
        <div style={{ display:'flex',gap:6 }}>
          {['All','Critical','High','Moderate','Low','None'].map(r=>(
            <button key={r} onClick={()=>setRisk(r)}
              style={{ padding:'6px 14px',borderRadius:20,border:riskFilter===r?'none':'1px solid var(--border)',background:riskFilter===r?'var(--primary)':'var(--bg2)',color:riskFilter===r?'#fff':'var(--text2)',cursor:'pointer',fontSize:12,fontWeight:riskFilter===r?600:400 }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center',padding:48,color:'var(--text3)' }}>
          <div style={{ width:32,height:32,border:'3px solid rgba(255,255,255,0.1)',borderTopColor:'var(--primary)',borderRadius:'50%',animation:'spin 0.7s linear infinite',margin:'0 auto 12px' }} />
          <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          Loading students...
        </div>
      ) : (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14 }}>
          {filtered.map(s => {
            const risk = s.stress?.risk_level;
            return (
              <div key={s.id} style={{ background:'var(--bg2)',border:`1px solid ${risk==='critical'?'rgba(248,113,113,0.4)':risk==='high'?'rgba(249,115,22,0.3)':'var(--border)'}`,borderRadius:12,padding:16 }}>
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
                  {risk && <span style={{ fontSize:10,fontWeight:700,color:riskColor[risk],background:riskBg[risk],padding:'2px 8px',borderRadius:20,textTransform:'uppercase',flexShrink:0 }}>{risk}</span>}
                </div>

                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:s.stress?10:0 }}>
                  <div style={{ background:'var(--bg3)',borderRadius:8,padding:'8px 10px' }}>
                    <div style={{ fontSize:10,color:'var(--text3)',marginBottom:2 }}>Latest Mood</div>
                    <div style={{ fontWeight:700,color:s.mood?moodColor(s.mood.mood_score):'var(--text3)',fontSize:15 }}>
                      {s.mood ? `${s.mood.mood_score}/10` : '—'}
                    </div>
                    {s.mood && <div style={{ fontSize:10,color:'var(--text3)' }}>{fmt(s.mood.logged_at)}</div>}
                  </div>
                  <div style={{ background:'var(--bg3)',borderRadius:8,padding:'8px 10px' }}>
                    <div style={{ fontSize:10,color:'var(--text3)',marginBottom:2 }}>Stress Score</div>
                    <div style={{ fontWeight:700,color:risk?riskColor[risk]:'var(--text3)',fontSize:15 }}>
                      {s.stress ? `${s.stress.score}/100` : '—'}
                    </div>
                    {s.stress && <div style={{ fontSize:10,color:'var(--text3)' }}>{fmt(s.stress.computed_at)}</div>}
                  </div>
                </div>

                {s.stress && (
                  <div style={{ height:4,background:'rgba(255,255,255,0.07)',borderRadius:2,overflow:'hidden' }}>
                    <div style={{ width:`${s.stress.score}%`,height:'100%',background:riskColor[risk]||'var(--primary)',borderRadius:2,transition:'width 0.3s' }} />
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && !loading && (
            <div style={{ gridColumn:'1/-1',textAlign:'center',padding:40,color:'var(--text3)',fontSize:13 }}>
              {search || riskFilter!=='All' ? 'No students match your filters.' : 'No students registered yet.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}