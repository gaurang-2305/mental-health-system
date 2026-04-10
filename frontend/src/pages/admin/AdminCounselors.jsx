import { useState, useEffect } from 'react';
import { UserPlus, Users, Trash2, Loader2, Sparkles, Mail, Clock, Key, X, CheckCircle } from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────────────────
const getToken = () =>
  localStorage.getItem('access_token') ||
  localStorage.getItem('token') ||
  sessionStorage.getItem('access_token') || '';

async function apiFetch(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─── constants ────────────────────────────────────────────────────────────────
const SPECIALIZATIONS = [
  'Anxiety & Stress Management',
  'Depression & Emotional Wellbeing',
  'Academic Stress & Career Counseling',
  'Trauma & PTSD',
  'Relationship & Family Issues',
  'Substance Use & Addiction',
  'General Counseling',
];

const EMPTY_FORM = {
  full_name: '',
  email: '',
  specialization: SPECIALIZATIONS[0],
  qualification: '',
  availability_hours: 'Mon–Fri, 10am–5pm',
  max_students: 25,
};

// ─── toast ────────────────────────────────────────────────────────────────────
function notify(msg, type = 'ok') {
  const el = document.createElement('div');
  el.textContent = msg;
  Object.assign(el.style, {
    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
    padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600,
    background: type === 'ok' ? '#166534' : '#9f1239', color: '#fff',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'opacity .3s',
  });
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = 0; setTimeout(() => el.remove(), 300); }, 3000);
}

// ─── CounselorCard ────────────────────────────────────────────────────────────
function CounselorCard({ c, onRemove }) {
  const p = c.counselor_profiles?.[0] || {};
  return (
    <div style={{
      background: 'var(--card,#fff)', border: '1px solid var(--border,#e2e8f0)',
      borderRadius: 14, padding: '18px 20px', marginBottom: 10,
      display: 'flex', alignItems: 'flex-start', gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 11, background: '#fef3c7', color: '#b45309',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: 17, flexShrink: 0,
      }}>
        {(c.full_name || '?')[0].toUpperCase()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text,#1e293b)' }}>{c.full_name}</span>
          <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#dcfce7', color: '#166534' }}>
            Active
          </span>
        </div>
        <div style={{ fontSize: 13, color: '#b45309', fontWeight: 600, marginBottom: 2 }}>
          {p.specialization || 'General Counseling'}
        </div>
        {p.qualification && (
          <div style={{ fontSize: 12, color: 'var(--text2,#64748b)', marginBottom: 5 }}>{p.qualification}</div>
        )}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text2,#64748b)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Mail size={11} />{c.email}
          </span>
          {p.availability_hours && (
            <span style={{ fontSize: 12, color: 'var(--text2,#64748b)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} />{p.availability_hours}
            </span>
          )}
          {p.max_students && (
            <span style={{ fontSize: 12, color: 'var(--text2,#64748b)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users size={11} />Max {p.max_students} students
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onRemove(c.id, c.full_name)}
        title="Deactivate"
        style={{ padding: 7, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#cbd5e1', flexShrink: 0 }}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────
export default function AdminCounselors() {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [creating, setCreating]     = useState(false);
  const [seeding, setSeeding]       = useState(false);
  const [tempPwd, setTempPwd]       = useState('');
  const [form, setForm]             = useState(EMPTY_FORM);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const load = async () => {
    try {
      const d = await apiFetch('/counselors');
      setCounselors(d.counselors || []);
    } catch { notify('Failed to load counselors', 'err'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const d = await apiFetch('/counselors', { method: 'POST', body: JSON.stringify(form) });
      notify(`${form.full_name} added!`);
      setTempPwd(d.temp_password || 'MindCare@2025');
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) { notify(err.message, 'err'); }
    finally { setCreating(false); }
  };

  const handleSeed = async () => {
    if (!window.confirm('Create 3 demo counselors with password MindCare@2025?')) return;
    setSeeding(true);
    try {
      const d = await apiFetch('/counselors/seed', { method: 'POST' });
      notify(`Created: ${d.created?.join(', ') || 'done'}`);
      setTempPwd('MindCare@2025');
      load();
    } catch (err) { notify(err.message, 'err'); }
    finally { setSeeding(false); }
  };

  const handleRemove = async (id, name) => {
    if (!window.confirm(`Deactivate ${name}?`)) return;
    try {
      await apiFetch(`/counselors/${id}`, { method: 'DELETE' });
      notify(`${name} deactivated`);
      load();
    } catch { notify('Failed to deactivate', 'err'); }
  };

  const inp = {
    width: '100%', padding: '10px 13px', borderRadius: 10,
    border: '1px solid var(--border,#e2e8f0)',
    background: 'var(--bg,#f8fafc)', color: 'var(--text,#1e293b)',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };

  const btnPrimary = {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '10px 16px', borderRadius: 11, border: 'none',
    background: 'var(--primary,#3d6b3d)', color: '#fff',
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
  };

  return (
    <div style={{ padding: 32, maxWidth: 860, margin: '0 auto', fontFamily: 'inherit' }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--text,#1e293b)' }}>Counselors</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text2,#64748b)' }}>
            {counselors.length} active counselor{counselors.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {counselors.length === 0 && (
            <button onClick={handleSeed} disabled={seeding}
              style={{ ...btnPrimary, background: '#f59e0b' }}>
              {seeding ? <Loader2 size={14} style={{ animation: 'spin .7s linear infinite' }} /> : <Sparkles size={14} />}
              {seeding ? 'Seeding…' : 'Seed Demo Counselors'}
            </button>
          )}
          <button onClick={() => setShowForm(s => !s)} style={btnPrimary}>
            <UserPlus size={14} /> Add Counselor
          </button>
        </div>
      </div>

      {/* temp password banner */}
      {tempPwd && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 13, padding: '14px 18px', marginBottom: 20 }}>
          <Key size={17} style={{ color: '#b45309', marginTop: 1, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700, color: '#92400e', fontSize: 14 }}>Account created</p>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#b45309' }}>
              Temporary password:{' '}
              <code style={{ background: '#fde68a', padding: '1px 7px', borderRadius: 6, fontWeight: 800 }}>{tempPwd}</code>
              {' '}— share this with the counselor.
            </p>
          </div>
          <button onClick={() => setTempPwd('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#b45309' }}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* create form */}
      {showForm && (
        <div style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#e2e8f0)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700, color: 'var(--text,#1e293b)' }}>New Counselor Account</h2>
          <form onSubmit={handleCreate}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2,#64748b)', marginBottom: 5 }}>Full Name *</label>
                <input style={inp} placeholder="Dr. Jane Smith" required
                  value={form.full_name} onChange={e => set('full_name', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2,#64748b)', marginBottom: 5 }}>Email *</label>
                <input type="email" style={inp} placeholder="jane@college.edu" required
                  value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2,#64748b)', marginBottom: 5 }}>Specialization</label>
                <select style={inp} value={form.specialization} onChange={e => set('specialization', e.target.value)}>
                  {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2,#64748b)', marginBottom: 5 }}>Max Students</label>
                <input type="number" style={inp} value={form.max_students}
                  onChange={e => set('max_students', parseInt(e.target.value))} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2,#64748b)', marginBottom: 5 }}>Qualification</label>
              <input style={inp} placeholder="M.Phil Clinical Psychology, RCI Registered"
                value={form.qualification} onChange={e => set('qualification', e.target.value)} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2,#64748b)', marginBottom: 5 }}>Availability</label>
              <input style={inp} placeholder="Mon–Fri, 10am–5pm"
                value={form.availability_hours} onChange={e => set('availability_hours', e.target.value)} />
            </div>

            <p style={{ fontSize: 12, color: 'var(--text2,#64748b)', background: 'var(--bg,#f8fafc)', borderRadius: 9, padding: '10px 14px', marginBottom: 16 }}>
              Temporary password <code style={{ fontWeight: 700 }}>MindCare@2025</code> will be set. Counselor can change it after first login.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border,#e2e8f0)', background: 'transparent', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--text,#1e293b)' }}>
                Cancel
              </button>
              <button type="submit" disabled={creating} style={{ ...btnPrimary, flex: 1, justifyContent: 'center' }}>
                {creating
                  ? <><Loader2 size={14} style={{ animation: 'spin .7s linear infinite' }} /> Creating…</>
                  : <><CheckCircle size={14} /> Create Counselor</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* empty state */}
      {!loading && counselors.length === 0 && !showForm && (
        <div style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#e2e8f0)', borderRadius: 18, padding: '56px 24px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Users size={26} style={{ color: '#f59e0b' }} />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: 'var(--text,#1e293b)' }}>No counselors yet</h3>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--text2,#64748b)', maxWidth: 360, marginInline: 'auto' }}>
            Students can't book appointments without counselors. Seed demo accounts or add one manually.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleSeed} disabled={seeding}
              style={{ ...btnPrimary, background: '#f59e0b' }}>
              <Sparkles size={14} /> Seed Demo Counselors
            </button>
            <button onClick={() => setShowForm(true)} style={btnPrimary}>
              <UserPlus size={14} /> Add Manually
            </button>
          </div>
        </div>
      )}

      {/* loading spinner */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Loader2 size={30} style={{ color: '#cbd5e1', animation: 'spin .7s linear infinite' }} />
        </div>
      )}

      {/* counselor list */}
      {!loading && counselors.map(c => (
        <CounselorCard key={c.id} c={c} onRemove={handleRemove} />
      ))}
    </div>
  );
}