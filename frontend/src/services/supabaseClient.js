import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ── Loud warning if env vars are missing ──────────────────────────────────────
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '\n❌ [MindCare] MISSING SUPABASE ENV VARS\n' +
    'Create frontend/.env with:\n' +
    '  VITE_SUPABASE_URL=https://xxxx.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=eyJh...\n' +
    'Then restart the dev server (npm run dev)\n'
  );
}

export const supabase = createClient(
  supabaseUrl     || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession:    true,
      autoRefreshToken:  true,
      detectSessionInUrl: true,
    },
    global: {
      headers: { 'x-app-name': 'mindcare' },
    },
  }
);

// ── Convenience helpers (unchanged from original) ─────────────────────────────

export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data?.session ?? null;
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user ?? null;
};

export const uploadFile = async (bucket, path, file, contentType) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: contentType || file.type, upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return urlData.publicUrl;
};

export const deleteFile = async (bucket, path) => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
  return true;
};

export const subscribeToTable = (table, userId, callback, event = 'INSERT') => {
  return supabase
    .channel(`${table}:${userId}:${Date.now()}`)
    .on('postgres_changes',
      { event, schema: 'public', table, filter: `user_id=eq.${userId}` },
      (payload) => callback(payload.new ?? payload.old ?? payload)
    )
    .subscribe();
};

export const paginatedSelect = async (table, opts = {}) => {
  const {
    select = '*', filters = {}, orderBy = 'created_at',
    ascending = false, page = 1, pageSize = 20,
  } = opts;
  const from = (page - 1) * pageSize;
  const to   = from + pageSize - 1;

  let query = supabase
    .from(table)
    .select(select, { count: 'exact' })
    .order(orderBy, { ascending })
    .range(from, to);

  Object.entries(filters).forEach(([col, val]) => {
    if (val !== undefined && val !== null && val !== '') query = query.eq(col, val);
  });

  const { data, error, count } = await query;
  if (error) throw error;
  return {
    data: data || [], count: count || 0, page, pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
    hasMore: to < (count || 0) - 1,
  };
};

export default supabase;