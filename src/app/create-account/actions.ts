import { createClient } from '@/utils/supabase/server';

export async function resendConfirmationEmail(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email
  });

  return { success: !error, error: error?.message };
}
