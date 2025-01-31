import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createTestClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key to bypass RLS
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
}
