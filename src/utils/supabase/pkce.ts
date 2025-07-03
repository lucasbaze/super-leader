import { createBrowserClient } from '@supabase/ssr';

export const supabasePKCE = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
);
