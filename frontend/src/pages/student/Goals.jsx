// ════════════════════════════════════════
// Goals.jsx — student/Goals.jsx
// ════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createGoal, getGoals, updateGoal } from '../../services/dataService';
import { Button, Loader } from '../../components/ui/index.jsx';

const CARD = { background:'rgba(255,252,248,0.92)', border:'1px solid rgba(160,120,80,0.15)', borderRadius:18, padding:'24px', boxShadow:'0 2px 12px rgba(80,50,20,0.07)' };
const CARD_TITLE = { fontFamily:"'Cormorant Garamond',serif", fontSize:'1.2rem', color:'#2c1f12', fontWeight:500, marginBottom:16, paddingBottom:12, borderBottom:'1px solid rgba(160,120,80,0.1)' };

export default function Goals() {
  const { profile } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', target_date:'' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile?.id) getGoals(profile.id).then(d=>{setGoals(d);setLoading(false);}).catch(()=>setLoading(false));
  }, [profile?.id]);

  async function handleCreate() {
    if (!form.title.trim()) { setError('Please enter a goal title'); return; }
    setSaving(true); setError('');
    try {
      const g = await createGoal(profile.id, { title:form.title.trim(), description:form.description.trim(), target_date:form.target_date||null });
      setGoals(prev=>[g,...prev]); setShowModal(false); setForm({ title:'', description:'', target_date:'' });
    } catch (e) { setError(e.message||'Failed to create goal'); }
    finally { setSaving(false); }
  }

  async function toggleGoal(goal) {
    try {
      const updated = await updateGoal(goal.id, { is_completed: !goal.is_completed });
      setGoals(prev=>prev.map(g=>g.id===goal.id?updated:g));
    } catch(e) { console.error(e); }
  }

  async function deleteGoalById(id) {
    try {
      const { supabase } = await import('../../services/supabaseClient');
      await supabase.from('goals').delete().eq('id',id);
      setGoals(prev=>prev.filter(g=>g.id!==id));
    } catch(e) { console.error(e); }
  }

  const active = goals.filter(g=>!g.is_completed);
  const completed = goals.filter(g=>g.is_completed);
  const rate = goals.length ? Math.round((completed.length/goals.length)*100) : 0;

  if (loading) return <div style={{ padding:36 }}><Loader /></div>;

  return (
    <div className="animate-fade" style={{ padding:'32px 36px', maxWidth:1100 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:28 }}>
        <div>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:'2px', color:'#c4a882', textTransform:'uppercase', marginBottom:4, fontFamily:"'Outfit',sans-serif" }}>Wellness</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'2.2rem', fontWeight:600, color:'#2c1f12' }}>Goals</h1>
          <p style={{ color:'#a8896e', fontSize:14, marginTop:4, fontFamily:"'Outfit',sans-serif" }}>Set and track your mental wellness goals.</p>
        </div>
        <Button onClick={()=>{setError('');setShowModal(true);}}>+ New Goal</Button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:28 }}>
        {[
          { label:'Active Goals', value:active.length, icon:'◇', color:'#a07850' },
          { label:'Completed',    value:completed.length, icon:'✓', color:'#5a8a65' },
          { label:'Completion Rate', value:`${rate}%`, icon:'◈', color:'#4a7a9b' },
        ].map(s=>(
          <div key={s.label} style={{ ...CARD, display:'flex', gap:16, alignItems:'center' }}>
            <div style={{ width:44, height:44, borderRadius:12, background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:s.color, border:`1px solid ${s.color}25`, flexShrink:0 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.8rem', fontWeight:600, color:s.color, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:11, color:'#c4a882', marginTop:4, fontFamily:"'Outfit',sans-serif" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {goals.length === 0 ? (
        <div style={{ ...CARD, textAlign:'center', padding:'52px 24px' }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'3rem', color:'#c4a882', marginBottom:14 }}>◇</div>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", color:'#7a5c44', marginBottom:10, fontSize:'1.4rem' }}>No goals yet</h3>
          <p style={{ marginBottom:24, fontSize:14, color:'#a8896e', fontFamily:"'Outfit',sans-serif" }}>Set your first mental wellness goal to track your progress</p>
          <Button onClick={()=>setShowModal(true)}>Create First Goal</Button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <div style={CARD}>
            <div style={CARD_TITLE}>Active Goals ({active.length})</div>
            {active.length===0 ? (
              <div style={{ color:'#5a8a65', fontSize:13, padding:'12px 0', fontFamily:"'Outfit',sans-serif" }}>🎉 All goals completed!</div>
            ) : active.map(g=>(
              <div key={g.id} style={{ display:'flex', gap:10, padding:'13px 0', borderBottom:'1px solid rgba(160,120,80,0.08)', alignItems:'flex-start' }}>
                <button onClick={()=>toggleGoal(g)} style={{ background:'none', border:'1.5px solid rgba(160,120,80,0.35)', borderRadius:'50%', width:22, height:22, cursor:'pointer', flexShrink:0, marginTop:2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#a07850', transition:'all 0.15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(160,120,80,0.1)';}} onMouseLeave={e=>{e.currentTarget.style.background='none';}} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:500, fontSize:14, color:'#2c1f12', fontFamily:"'Outfit',sans-serif" }}>{g.title}</div>
                  {g.description && <div style={{ fontSize:12, color:'#a8896e', marginTop:3, fontFamily:"'Outfit',sans-serif" }}>{g.description}</div>}
                  {g.target_date && <div style={{ fontSize:11, color:'#a07850', marginTop:5, fontFamily:"'Outfit',sans-serif" }}>◻ Due: {new Date(g.target_date).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})}</div>}
                </div>
                <button onClick={()=>deleteGoalById(g.id)} style={{ background:'none', color:'rgba(184,74,74,0.5)', cursor:'pointer', fontSize:15, padding:0, border:'none', flexShrink:0, transition:'color 0.15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.color='#b84a4a';}} onMouseLeave={e=>{e.currentTarget.style.color='rgba(184,74,74,0.5)';}}>✕</button>
              </div>
            ))}
          </div>
          <div style={CARD}>
            <div style={CARD_TITLE}>Completed ({completed.length})</div>
            {completed.length===0 ? (
              <div style={{ color:'#c4a882', fontSize:13, padding:'12px 0', fontFamily:"'Outfit',sans-serif" }}>Complete your first goal!</div>
            ) : completed.map(g=>(
              <div key={g.id} style={{ display:'flex', gap:10, padding:'13px 0', borderBottom:'1px solid rgba(160,120,80,0.08)', opacity:0.72, alignItems:'flex-start' }}>
                <button onClick={()=>toggleGoal(g)} style={{ background:'rgba(90,138,101,0.15)', border:'1.5px solid rgba(90,138,101,0.5)', borderRadius:'50%', width:22, height:22, cursor:'pointer', flexShrink:0, marginTop:2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#5a8a65' }}>✓</button>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:400, fontSize:14, textDecoration:'line-through', color:'#a8896e', fontFamily:"'Outfit',sans-serif" }}>{g.title}</div>
                  {g.description && <div style={{ fontSize:12, color:'#c4a882', marginTop:3, fontFamily:"'Outfit',sans-serif" }}>{g.description}</div>}
                </div>
                <button onClick={()=>deleteGoalById(g.id)} style={{ background:'none', color:'rgba(184,74,74,0.4)', cursor:'pointer', fontSize:15, padding:0, border:'none', flexShrink:0 }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div onClick={()=>{setShowModal(false);setError('');}} style={{ position:'fixed', inset:0, background:'rgba(44,31,18,0.55)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'rgba(255,252,248,0.97)', border:'1px solid rgba(160,120,80,0.2)', borderRadius:20, width:'100%', maxWidth:460, padding:'28px 32px', boxShadow:'0 24px 64px rgba(44,31,18,0.22)', animation:'fadeIn 0.2s ease' }}>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.4rem', color:'#2c1f12', marginBottom:20 }}>New Wellness Goal</h3>
            {error && <div style={{ background:'rgba(184,74,74,0.08)', border:'1px solid rgba(184,74,74,0.28)', borderRadius:9, padding:'10px 13px', marginBottom:14, color:'#b84a4a', fontSize:13, fontFamily:"'Outfit',sans-serif" }}>{error}</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[['Goal Title *','text','e.g. Meditate 10 mins daily','title'],['Description (optional)','text','Why is this goal important to you?','description']].map(([lbl,type,ph,key])=>(
                <div key={key}>
                  <label style={{ display:'block', fontSize:10.5, fontWeight:700, color:'#7a5c44', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.7px' }}>{lbl}</label>
                  {key==='description' ? (
                    <textarea value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={ph} rows={3}
                      style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid rgba(160,120,80,0.24)', background:'rgba(255,252,248,0.9)', color:'#2c1f12', fontSize:13.5, fontFamily:"'Outfit',sans-serif", outline:'none', resize:'vertical', boxSizing:'border-box' }} />
                  ) : (
                    <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={ph} autoFocus={key==='title'}
                      style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid rgba(160,120,80,0.24)', background:'rgba(255,252,248,0.9)', color:'#2c1f12', fontSize:13.5, fontFamily:"'Outfit',sans-serif", outline:'none', boxSizing:'border-box' }} />
                  )}
                </div>
              ))}
              <div>
                <label style={{ display:'block', fontSize:10.5, fontWeight:700, color:'#7a5c44', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.7px' }}>Target Date (optional)</label>
                <input type="date" value={form.target_date} onChange={e=>setForm({...form,target_date:e.target.value})} min={new Date().toISOString().split('T')[0]}
                  style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid rgba(160,120,80,0.24)', background:'rgba(255,252,248,0.9)', color:'#2c1f12', fontSize:13.5, fontFamily:"'Outfit',sans-serif", outline:'none', boxSizing:'border-box' }} />
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:22 }}>
              <button onClick={()=>{setShowModal(false);setError('');}} style={{ flex:1, padding:'11px', borderRadius:24, border:'1.5px solid rgba(160,120,80,0.25)', background:'rgba(160,120,80,0.05)', color:'#6b5040', cursor:'pointer', fontFamily:"'Outfit',sans-serif", fontWeight:500, fontSize:13.5 }}>Cancel</button>
              <Button onClick={handleCreate} loading={saving} disabled={!form.title.trim()} style={{ flex:1 }}>Create Goal</Button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}