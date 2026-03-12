// Auth state (Supabase)
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Auth initialization logic
    setLoading(false);
  }, []);

  return { user, loading };
}
