import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[MindCare] Missing Supabase environment variables.\n' +
    'Create a .env file in /frontend with:\n' +
    '  VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=your-anon-key'
  );
}

/**
 * Shared Supabase client instance.
 * Import this everywhere: import { supabase } from '../services/supabaseClient';
 */
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    // Persist session in localStorage so users stay logged in across page refreshes
    persistSession: true,
    // Auto-refresh the JWT token before it expires
    autoRefreshToken: true,
    // Detect OAuth redirects automatically
    detectSessionInUrl: true,
  },
  realtime: {
    // Params forwarded to the Realtime server on connect
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      // Custom header so requests are identifiable in Supabase logs
      'x-app-name': 'mindcare',
    },
  },
});

// ─── Convenience helpers ────────────────────────────────────────────────────

/**
 * Returns the currently authenticated Supabase user, or null.
 */
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data?.session ?? null;
};

/**
 * Returns the currently authenticated user object, or null.
 */
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user ?? null;
};

/**
 * Upload a file to a Supabase Storage bucket.
 * Returns the public URL on success, throws on error.
 *
 * @param {string} bucket   - Storage bucket name, e.g. 'avatars'
 * @param {string} path     - File path inside the bucket, e.g. 'user-id/avatar.png'
 * @param {File}   file     - Browser File object
 * @param {string} [contentType] - MIME type override
 */
export const uploadFile = async (bucket, path, file, contentType) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: contentType || file.type,
      upsert: true,
    });
  if (error) throw error;

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return urlData.publicUrl;
};

/**
 * Delete a file from a Supabase Storage bucket.
 */
export const deleteFile = async (bucket, path) => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
  return true;
};

/**
 * Subscribe to real-time row-level changes on a table for a specific user.
 * Returns the channel — call supabase.removeChannel(channel) to unsubscribe.
 *
 * @param {string}   table    - Table name, e.g. 'notifications'
 * @param {string}   userId   - The user_id to filter on
 * @param {Function} callback - Called with each new/updated row payload
 * @param {'INSERT'|'UPDATE'|'DELETE'|'*'} [event] - Default: 'INSERT'
 */
export const subscribeToTable = (table, userId, callback, event = 'INSERT') => {
  return supabase
    .channel(`${table}:${userId}:${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event,
        schema: 'public',
        table,
        filter: `user_id=eq.${userId}`,
      },
      (payload) => callback(payload.new ?? payload.old ?? payload)
    )
    .subscribe();
};

/**
 * A simple paginated select helper.
 *
 * @param {string} table
 * @param {object} opts
 * @param {string} [opts.select='*']
 * @param {object} [opts.filters]   - { column: value } equality filters
 * @param {string} [opts.orderBy='created_at']
 * @param {boolean} [opts.ascending=false]
 * @param {number}  [opts.page=1]
 * @param {number}  [opts.pageSize=20]
 */
export const paginatedSelect = async (table, opts = {}) => {
  const {
    select = '*',
    filters = {},
    orderBy = 'created_at',
    ascending = false,
    page = 1,
    pageSize = 20,
  } = opts;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(table)
    .select(select, { count: 'exact' })
    .order(orderBy, { ascending })
    .range(from, to);

  Object.entries(filters).forEach(([col, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query = query.eq(col, val);
    }
  });

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
    hasMore: to < (count || 0) - 1,
  };
};

export default supabase;