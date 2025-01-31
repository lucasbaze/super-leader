// utils/createTestUser.js
import { createSupabaseAdminClient } from './test-client';

export async function createTestUser(email: string, password: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true // Skip email confirmation for testing
  });
  if (error) throw error;
  return data.user;
}
