import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext({});

// Derive role from profile — tries roles(name) join first, falls back to role_id
function deriveRole(profile) {
  if (!profile) return 'student';
  // Prefer the joined role name
  if (profile.roles?.name) return profile.roles.name;
  // Numeric fallback so counselor/admin are never misrouted as 'student'
  if (profile.role_id === 3) return 'admin';
  if (profile.role_id === 2) return 'counselor';
  return 'student';
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*, roles(name)')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('[AuthContext] loadProfile error:', error.message);
        // Try without the join as fallback
        const { data: plain } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();
        setProfile(plain || null);
      } else {
        setProfile(data || null);
      }
    } catch (err) {
      console.error('[AuthContext] loadProfile threw:', err.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    // Safety net: stop spinner after 6s no matter what
    const timeout = setTimeout(() => {
      if (!mounted) return;
      console.warn('[AuthContext] Timed out — forcing login');
      setUser(null); setProfile(null); setLoading(false);
      try { Object.keys(localStorage).filter(k=>k.startsWith('sb-')).forEach(k=>localStorage.removeItem(k)); } catch {}
    }, 6000);

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      clearTimeout(timeout);
      if (error || !session?.user) {
        if (error) {
          try { Object.keys(localStorage).filter(k=>k.startsWith('sb-')).forEach(k=>localStorage.removeItem(k)); supabase.auth.signOut().catch(()=>{}); } catch {}
        }
        setUser(null); setProfile(null); setLoading(false);
        return;
      }
      setUser(session.user);
      loadProfile(session.user.id);
    }).catch(() => {
      if (!mounted) return;
      clearTimeout(timeout);
      setUser(null); setProfile(null); setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT') { setUser(null); setProfile(null); setLoading(false); return; }
      if (event === 'SIGNED_IN' && session?.user) { setUser(session.user); loadProfile(session.user.id); return; }
      if (event === 'TOKEN_REFRESHED' && session?.user) { setUser(session.user); }
    });

    return () => { mounted = false; clearTimeout(timeout); subscription.unsubscribe(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const role = deriveRole(profile);

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);