import { createClient } from '@supabase/supabase-js'

// Use service_role key for admin-level backend operations
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)