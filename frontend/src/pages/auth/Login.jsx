// frontend/src/pages/auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import { supabase } from '../../services/supabaseClient';

function BrainSVG() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="brainGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" stopOpacity=".95"/>
          <stop offset="100%" stopColor="rgba(255,255,255,.7)"/>
        </linearGradient>
      </defs>
      <path d="M18 4C18 4 11.5 4 9 9.5C6.5 15 8 19 8 19C8 19 6 21 6 24.5C6 28.5 9.5 32 13.5 32C13.5 32 15 33.5 18 33.5C21 33.5 22.5 32 22.5 32C26.5 32 30 28.5 30 24.5C30 21 28 19 28 19C28 19 29.5 15 27 9.5C24.5 4 18 4 18 4Z" fill="url(#brainGrad)"/>
      <path d="M18 7.5C18 7.5 14.5 8.5 13.5 12.5C12.5 16.5 14.5 18.5 14.5 18.5" stroke="rgba(79,142,247,.5)" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      <path d="M18 7.5C18 7.5 21.5 8.5 22.5 12.5C23.5 16.5 21.5 18.5 21.5 18.5" stroke="rgba(79,142,247,.5)" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      <path d="M13 23C13 23 15 25 18 25C21 25 23 23 23 23" stroke="rgba(79,142,247,.5)" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      <line x1="18" y1="5" x2="18" y2="33" stroke="rgba(79,142,247,.3)" strokeWidth=".7" strokeDasharray="2 3"/>
    </svg>
  );
}

export default function Login() {
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
      navigate(`/${profile?.roles?.name || 'student'}`);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
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
        @keyframes pulseRing{0%{transform:scale(1);opacity:.35}100%{transform:scale(1.65);opacity:0}}
        @keyframes btnShimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes spinAnim{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes blobA{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(24px,-18px) scale(1.05)}70%{transform:translate(-16px,12px) scale(.97)}}
        @keyframes blobB{0%,100%{transform:translate(0,0)}55%{transform:translate(-20px,18px)}}

        .lg-root{
          min-height:100vh;
          background:linear-gradient(160deg,#eef2fc 0%,#f5f0fb 50%,#fce8f4 100%);
          display:flex;align-items:center;justify-content:center;
          padding:24px;
          font-family:'DM Sans',system-ui,sans-serif;
          position:relative;overflow:hidden;
        }
        .lg-root::before{
          content:'';position:fixed;inset:0;
          background-image:radial-gradient(circle,rgba(79,142,247,.15) 1px,transparent 1px);
          background-size:30px 30px;pointer-events:none;
        }

        .lg-blob{position:fixed;border-radius:50%;pointer-events:none}
        .lg-ba{width:500px;height:500px;background:radial-gradient(circle,rgba(79,142,247,.1) 0%,transparent 70%);top:-180px;left:-150px;animation:blobA 26s ease-in-out infinite}
        .lg-bb{width:420px;height:420px;background:radial-gradient(circle,rgba(124,92,191,.08) 0%,transparent 70%);bottom:-140px;right:-110px;animation:blobB 22s ease-in-out infinite}
        .lg-bc{width:220px;height:220px;background:radial-gradient(circle,rgba(224,90,156,.07) 0%,transparent 70%);top:36%;left:64%}

        .lg-wrap{width:100%;max-width:432px;position:relative;z-index:10}

        .rv{opacity:0;transform:translateY(20px);transition:opacity .5s ease,transform .5s ease}
        .rv.on{opacity:1;transform:translateY(0)}
        .d1{transition-delay:.06s}.d2{transition-delay:.16s}.d3{transition-delay:.26s}.d4{transition-delay:.33s}

        /* Brand */
        .lg-brand{text-align:center;margin-bottom:30px}
        .lg-ring{position:relative;width:70px;height:70px;margin:0 auto 18px;display:flex;align-items:center;justify-content:center}
        .lg-ring::before,.lg-ring::after{content:'';position:absolute;inset:-10px;border-radius:50%;border:1.5px solid rgba(79,142,247,.22)}
        .lg-ring::before{animation:pulseRing 2.8s ease-out infinite}
        .lg-ring::after{animation:pulseRing 2.8s ease-out .95s infinite}
        .lg-icon{
          width:70px;height:70px;border-radius:20px;
          background:linear-gradient(140deg,#4f8ef7 0%,#7c5cbf 100%);
          box-shadow:0 10px 32px rgba(79,142,247,.32),0 2px 8px rgba(124,92,191,.2);
          display:flex;align-items:center;justify-content:center;
        }
        .lg-name{
          font-family:'Syne',sans-serif;
          font-size:2.05rem;font-weight:800;color:#1e2a45;letter-spacing:-.4px;line-height:1;margin-bottom:7px;
        }
        .lg-name span{
          background:linear-gradient(90deg,#4f8ef7,#7c5cbf);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }
        .lg-sub{font-size:13.5px;font-weight:400;color:#7e8da0;letter-spacing:.1px}

        /* Card */
        .lg-card{
          background:rgba(255,255,255,.88);
          border:1px solid rgba(79,142,247,.13);
          border-radius:22px;padding:34px;
          box-shadow:0 8px 36px rgba(79,142,247,.1),0 2px 8px rgba(0,0,0,.04);
          backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
          position:relative;overflow:hidden;
        }
        .lg-card::before{
          content:'';position:absolute;top:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,#4f8ef7,#7c5cbf,#e05a9c);
          border-radius:22px 22px 0 0;
        }

        /* Error */
        .lg-err{
          background:#fff5f5;border:1px solid rgba(229,62,62,.2);border-radius:10px;
          padding:10px 14px;margin-bottom:18px;color:#c53030;font-size:13px;
          display:flex;align-items:center;gap:8px;animation:revealUp .2s ease;
        }
        .lg-err-msg{flex:1}
        .lg-err button{background:none;border:none;color:rgba(197,48,48,.45);cursor:pointer;font-size:15px;line-height:1;padding:0;flex-shrink:0;transition:color .15s}
        .lg-err button:hover{color:#c53030}

        /* Field */
        .lg-field{margin-bottom:18px}
        .lg-lbl{display:block;font-size:11px;font-weight:600;color:#7e8da0;text-transform:uppercase;letter-spacing:.8px;margin-bottom:7px}
        .lg-row{position:relative;display:flex;align-items:center}
        .lg-ico{position:absolute;left:13px;font-size:14px;color:#b8c5d6;pointer-events:none;transition:color .2s;line-height:1}
        .lg-row.act .lg-ico{color:#4f8ef7}
        .lg-inp{
          width:100%;background:#f7f9fd;border:1.5px solid #e2e8f2;border-radius:11px;
          color:#1e2a45;font-family:'DM Sans',sans-serif;font-size:14px;
          padding:12px 14px 12px 40px;outline:none;
          transition:border-color .2s,background .2s,box-shadow .2s;-webkit-appearance:none;
        }
        .lg-inp::placeholder{color:#c0cad8}
        .lg-inp:hover{border-color:#c8d3e8}
        .lg-inp:focus{border-color:#4f8ef7;background:#fff;box-shadow:0 0 0 3px rgba(79,142,247,.1)}

        /* Button */
        .lg-btn{
          width:100%;background:linear-gradient(135deg,#4f8ef7 0%,#7c5cbf 100%);
          border:none;border-radius:12px;color:#fff;
          font-family:'Syne',sans-serif;font-size:15px;font-weight:700;letter-spacing:.3px;
          padding:14px;cursor:pointer;margin-top:6px;position:relative;overflow:hidden;
          box-shadow:0 5px 20px rgba(79,142,247,.35);
          transition:transform .15s,box-shadow .2s,opacity .15s;
        }
        .lg-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.14),transparent)}
        .lg-btn-sh{position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);animation:btnShimmer 2.2s ease infinite}
        .lg-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 10px 30px rgba(79,142,247,.45),0 4px 12px rgba(124,92,191,.25)}
        .lg-btn:active:not(:disabled){transform:translateY(0)}
        .lg-btn:disabled{opacity:.55;cursor:not-allowed}
        .lg-spin{display:inline-block;width:15px;height:15px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:spinAnim .75s linear infinite;margin-right:7px;vertical-align:middle}

        .lg-div{display:flex;align-items:center;gap:12px;margin:22px 0}
        .lg-divline{flex:1;height:1px;background:#edf1f8}
        .lg-divtxt{font-size:11px;color:#b8c5d6;text-transform:uppercase;letter-spacing:.9px}

        .lg-linkrow{text-align:center;font-size:13.5px;color:#7e8da0}
        .lg-linkrow a{color:#4f8ef7;text-decoration:none;font-weight:500;transition:color .15s}
        .lg-linkrow a:hover{color:#3a7aef}

        /* Admin switch pill */
        .lg-switch{margin-top:16px;text-align:center}
        .lg-switch a{
          display:inline-flex;align-items:center;gap:7px;
          background:rgba(255,255,255,.75);
          border:1.5px solid #e2e8f2;border-radius:30px;
          padding:9px 20px;
          font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:500;
          color:#6b7a96;text-decoration:none;
          box-shadow:0 1px 4px rgba(0,0,0,.05);
          transition:border-color .2s,color .2s,box-shadow .2s,background .2s;
        }
        .lg-switch a:hover{border-color:#b8c5d6;color:#1e2a45;background:#fff;box-shadow:0 3px 12px rgba(0,0,0,.08)}

        .lg-trust{display:flex;justify-content:center;gap:20px;margin-top:18px}
        .lg-ti{display:flex;align-items:center;gap:5px;font-size:10.5px;color:#b8c5d6}
        .lg-td{width:5px;height:5px;border-radius:50%;background:linear-gradient(135deg,#4f8ef7,#7c5cbf)}
      `}</style>

      <div className="lg-root">
        <div className="lg-blob lg-ba" />
        <div className="lg-blob lg-bb" />
        <div className="lg-blob lg-bc" />

        <div className="lg-wrap">
          <div className={`lg-brand rv d1 ${visible ? 'on' : ''}`}>
            <div className="lg-ring">
              <div className="lg-icon"><BrainSVG /></div>
            </div>
            <h1 className="lg-name">Mind<span>Care</span></h1>
            <p className="lg-sub">Your mental wellness companion</p>
          </div>

          <div className={`lg-card rv d2 ${visible ? 'on' : ''}`}>
            {error && (
              <div className="lg-err">
                <span>⚠</span>
                <span className="lg-err-msg">{error}</span>
                <button onClick={() => setError('')}>✕</button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="lg-field">
                <label className="lg-lbl">Email address</label>
                <div className={`lg-row ${focused === 'email' ? 'act' : ''}`}>
                  <span className="lg-ico">✉</span>
                  <input className="lg-inp" type="email" placeholder="you@university.edu"
                    value={form.email} autoComplete="email"
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} required />
                </div>
              </div>

              <div className="lg-field">
                <label className="lg-lbl">Password</label>
                <div className={`lg-row ${focused === 'pwd' ? 'act' : ''}`}>
                  <span className="lg-ico">🔒</span>
                  <input className="lg-inp" type="password" placeholder="Enter your password"
                    value={form.password} autoComplete="current-password"
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    onFocus={() => setFocused('pwd')} onBlur={() => setFocused(null)} required />
                </div>
              </div>

              <button className="lg-btn" type="submit" disabled={loading || !form.email || !form.password}>
                {!loading && <div className="lg-btn-sh" />}
                {loading ? <><span className="lg-spin" />Signing in...</> : 'Sign In →'}
              </button>
            </form>

            <div className="lg-div">
              <div className="lg-divline" /><span className="lg-divtxt">or</span><div className="lg-divline" />
            </div>
            <div className="lg-linkrow">
              New to MindCare? <Link to="/register">Create a free account</Link>
            </div>
          </div>

          <div className={`lg-switch rv d3 ${visible ? 'on' : ''}`}>
            <Link to="/admin-login">
              <span>⚙️</span> Switch to Admin Portal
            </Link>
          </div>

          <div className={`lg-trust rv d4 ${visible ? 'on' : ''}`}>
            <div className="lg-ti"><div className="lg-td" />Encrypted</div>
            <div className="lg-ti"><div className="lg-td" />Confidential</div>
            <div className="lg-ti"><div className="lg-td" />Secure</div>
          </div>
        </div>
      </div>
    </>
  );
}