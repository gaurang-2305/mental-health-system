// frontend/src/pages/auth/AdminLogin.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import { supabase } from '../../services/supabaseClient';

export default function AdminLogin() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => setVisible(true), 60); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await loginUser(form.email, form.password);
      if (!user) throw new Error('Login failed');
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*, roles(name)')
        .eq('id', user.id)
        .single();
      if (profile?.roles?.name !== 'admin') throw new Error('Access denied — admin accounts only.');
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        @keyframes revealUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulseRing{0%{transform:scale(1);opacity:.35}100%{transform:scale(1.6);opacity:0}}
        @keyframes btnShimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes spinAnim{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes blobA{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(20px,-16px) scale(1.04)}70%{transform:translate(-14px,10px) scale(.97)}}
        @keyframes blobB{0%,100%{transform:translate(0,0)}55%{transform:translate(-18px,16px)}}

        .adm-root{
          min-height:100vh;
          background:linear-gradient(160deg,#fdf8ee 0%,#fef3d6 50%,#fff8e6 100%);
          display:flex;align-items:center;justify-content:center;
          padding:24px;
          font-family:'DM Sans',system-ui,sans-serif;
          position:relative;overflow:hidden;
        }
        .adm-root::before{
          content:'';position:fixed;inset:0;
          background-image:radial-gradient(circle,rgba(251,191,36,.18) 1px,transparent 1px);
          background-size:30px 30px;pointer-events:none;
        }

        .adm-blob{position:fixed;border-radius:50%;pointer-events:none}
        .adm-ba{width:480px;height:480px;background:radial-gradient(circle,rgba(251,191,36,.1) 0%,transparent 70%);top:-160px;right:-130px;animation:blobA 26s ease-in-out infinite}
        .adm-bb{width:400px;height:400px;background:radial-gradient(circle,rgba(245,158,11,.08) 0%,transparent 70%);bottom:-130px;left:-100px;animation:blobB 22s ease-in-out infinite}
        .adm-bc{width:200px;height:200px;background:radial-gradient(circle,rgba(217,119,6,.06) 0%,transparent 70%);top:40%;left:5%}

        .adm-wrap{width:100%;max-width:432px;position:relative;z-index:10}

        .rv{opacity:0;transform:translateY(20px);transition:opacity .5s ease,transform .5s ease}
        .rv.on{opacity:1;transform:translateY(0)}
        .d1{transition-delay:.06s}.d2{transition-delay:.16s}.d3{transition-delay:.26s}.d4{transition-delay:.33s}

        /* Back link */
        .adm-back-row{margin-bottom:20px}
        .adm-back-link{
          display:inline-flex;align-items:center;gap:6px;
          font-size:13px;font-weight:500;color:#92714a;text-decoration:none;
          transition:color .15s;
        }
        .adm-back-link:hover{color:#6b4f2c}

        /* Brand */
        .adm-brand{text-align:center;margin-bottom:28px}
        .adm-ring{position:relative;width:70px;height:70px;margin:0 auto 18px;display:flex;align-items:center;justify-content:center}
        .adm-ring::before,.adm-ring::after{content:'';position:absolute;inset:-10px;border-radius:50%;border:1.5px solid rgba(251,191,36,.28)}
        .adm-ring::before{animation:pulseRing 2.8s ease-out infinite}
        .adm-ring::after{animation:pulseRing 2.8s ease-out .95s infinite}
        .adm-icon{
          width:70px;height:70px;border-radius:20px;
          background:linear-gradient(140deg,#f59e0b 0%,#d97706 100%);
          box-shadow:0 10px 32px rgba(245,158,11,.3),0 2px 8px rgba(217,119,6,.2);
          display:flex;align-items:center;justify-content:center;font-size:30px;
        }
        .adm-name{
          font-family:'Syne',sans-serif;
          font-size:2rem;font-weight:800;color:#2d1f00;letter-spacing:-.4px;line-height:1;margin-bottom:7px;
        }
        .adm-name span{
          background:linear-gradient(90deg,#d97706,#f59e0b);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }
        .adm-sub{font-size:13px;font-weight:400;color:#92714a;letter-spacing:.1px}

        /* Card */
        .adm-card{
          background:rgba(255,255,255,.88);
          border:1px solid rgba(245,158,11,.18);
          border-radius:22px;padding:34px;
          box-shadow:0 8px 36px rgba(245,158,11,.1),0 2px 8px rgba(0,0,0,.04);
          backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
          position:relative;overflow:hidden;
        }
        .adm-card::before{
          content:'';position:absolute;top:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,#f59e0b,#d97706,#b45309);
          border-radius:22px 22px 0 0;
        }

        /* Restricted badge */
        .adm-badge{
          background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);
          border-radius:9px;padding:9px 13px;margin-bottom:20px;
          font-size:12px;color:#92400e;
          display:flex;align-items:center;gap:7px;
        }

        /* Error */
        .adm-err{
          background:#fff5f5;border:1px solid rgba(229,62,62,.2);border-radius:10px;
          padding:10px 14px;margin-bottom:18px;color:#c53030;font-size:13px;
          display:flex;align-items:center;gap:8px;animation:revealUp .2s ease;
        }
        .adm-err-msg{flex:1}
        .adm-err button{background:none;border:none;color:rgba(197,48,48,.45);cursor:pointer;font-size:15px;line-height:1;padding:0;flex-shrink:0;transition:color .15s}
        .adm-err button:hover{color:#c53030}

        /* Field */
        .adm-field{margin-bottom:18px}
        .adm-lbl{display:block;font-size:11px;font-weight:600;color:#92714a;text-transform:uppercase;letter-spacing:.8px;margin-bottom:7px}
        .adm-row{position:relative;display:flex;align-items:center}
        .adm-ico{position:absolute;left:13px;font-size:14px;color:#c9a96e;pointer-events:none;transition:color .2s;line-height:1}
        .adm-row.act .adm-ico{color:#d97706}
        .adm-inp{
          width:100%;background:#fffbf0;border:1.5px solid #f0ddb0;border-radius:11px;
          color:#2d1f00;font-family:'DM Sans',sans-serif;font-size:14px;
          padding:12px 14px 12px 40px;outline:none;
          transition:border-color .2s,background .2s,box-shadow .2s;-webkit-appearance:none;
        }
        .adm-inp::placeholder{color:#d9c49a}
        .adm-inp:hover{border-color:#d9b87a}
        .adm-inp:focus{border-color:#d97706;background:#fff;box-shadow:0 0 0 3px rgba(217,119,6,.1)}

        /* Button */
        .adm-btn{
          width:100%;background:linear-gradient(135deg,#d97706 0%,#b45309 100%);
          border:none;border-radius:12px;color:#fff;
          font-family:'Syne',sans-serif;font-size:15px;font-weight:700;letter-spacing:.3px;
          padding:14px;cursor:pointer;margin-top:6px;position:relative;overflow:hidden;
          box-shadow:0 5px 20px rgba(217,119,6,.35);
          transition:transform .15s,box-shadow .2s,opacity .15s;
        }
        .adm-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.14),transparent)}
        .adm-btn-sh{position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);animation:btnShimmer 2.2s ease infinite}
        .adm-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 10px 30px rgba(217,119,6,.4)}
        .adm-btn:active:not(:disabled){transform:translateY(0)}
        .adm-btn:disabled{opacity:.55;cursor:not-allowed}
        .adm-spin{display:inline-block;width:15px;height:15px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:spinAnim .75s linear infinite;margin-right:7px;vertical-align:middle}

        .adm-div{display:flex;align-items:center;gap:12px;margin:22px 0}
        .adm-divline{flex:1;height:1px;background:#f0ddb0}
        .adm-divtxt{font-size:11px;color:#c9a96e;text-transform:uppercase;letter-spacing:.9px}

        /* Switch to student/counselor pill */
        .adm-switch{margin-top:16px;text-align:center}
        .adm-switch a{
          display:inline-flex;align-items:center;gap:7px;
          background:rgba(255,255,255,.75);
          border:1.5px solid #f0ddb0;border-radius:30px;
          padding:9px 20px;
          font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:500;
          color:#92714a;text-decoration:none;
          box-shadow:0 1px 4px rgba(0,0,0,.05);
          transition:border-color .2s,color .2s,box-shadow .2s,background .2s;
        }
        .adm-switch a:hover{border-color:#c9a96e;color:#2d1f00;background:#fff;box-shadow:0 3px 12px rgba(0,0,0,.08)}

        .adm-trust{display:flex;justify-content:center;gap:20px;margin-top:18px}
        .adm-ti{display:flex;align-items:center;gap:5px;font-size:10.5px;color:#c9a96e}
        .adm-td{width:5px;height:5px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#d97706)}
      `}</style>

      <div className="adm-root">
        <div className="adm-blob adm-ba" />
        <div className="adm-blob adm-bb" />
        <div className="adm-blob adm-bc" />

        <div className="adm-wrap">
          {/* Back link */}
          <div className={`adm-back-row rv d1 ${visible ? 'on' : ''}`}>
            <Link to="/login" className="adm-back-link">
              ← Back to Student / Counselor Login
            </Link>
          </div>

          {/* Brand */}
          <div className={`adm-brand rv d1 ${visible ? 'on' : ''}`}>
            <div className="adm-ring">
              <div className="adm-icon">⚙️</div>
            </div>
            <h1 className="adm-name"><span>Admin</span> Portal</h1>
            <p className="adm-sub">MindCare system administration</p>
          </div>

          {/* Card */}
          <div className={`adm-card rv d2 ${visible ? 'on' : ''}`}>
            <div className="adm-badge">
              <span>🔐</span>
              Restricted access — authorized administrators only
            </div>

            {error && (
              <div className="adm-err">
                <span>⚠</span>
                <span className="adm-err-msg">{error}</span>
                <button onClick={() => setError('')}>✕</button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="adm-field">
                <label className="adm-lbl">Admin Email</label>
                <div className={`adm-row ${focused === 'email' ? 'act' : ''}`}>
                  <span className="adm-ico">✉</span>
                  <input className="adm-inp" type="email" placeholder="admin@mindcare.edu"
                    value={form.email} autoComplete="email"
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} required />
                </div>
              </div>

              <div className="adm-field">
                <label className="adm-lbl">Password</label>
                <div className={`adm-row ${focused === 'pwd' ? 'act' : ''}`}>
                  <span className="adm-ico">🔒</span>
                  <input className="adm-inp" type="password" placeholder="Enter admin password"
                    value={form.password} autoComplete="current-password"
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    onFocus={() => setFocused('pwd')} onBlur={() => setFocused(null)} required />
                </div>
              </div>

              <button className="adm-btn" type="submit" disabled={loading || !form.email || !form.password}>
                {!loading && <div className="adm-btn-sh" />}
                {loading ? <><span className="adm-spin" />Verifying...</> : 'Access Admin Panel →'}
              </button>
            </form>

            <div className="adm-div">
              <div className="adm-divline" /><span className="adm-divtxt">restricted</span><div className="adm-divline" />
            </div>

            <div style={{ textAlign: 'center', fontSize: '13px', color: '#92714a' }}>
              Not an admin?{' '}
              <Link to="/login" style={{ color: '#d97706', textDecoration: 'none', fontWeight: 500 }}>
                Student / Counselor login
              </Link>
            </div>
          </div>

          {/* Switch pill */}
          <div className={`adm-switch rv d3 ${visible ? 'on' : ''}`}>
            <Link to="/login">
              <span>🧠</span> Switch to Student / Counselor Login
            </Link>
          </div>

          <div className={`adm-trust rv d4 ${visible ? 'on' : ''}`}>
            <div className="adm-ti"><div className="adm-td" />Admin only</div>
            <div className="adm-ti"><div className="adm-td" />Audit logged</div>
            <div className="adm-ti"><div className="adm-td" />Secure</div>
          </div>
        </div>
      </div>
    </>
  );
}