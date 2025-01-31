import { SupabaseClient, User } from '@supabase/supabase-js';

export const cleanupUserData = async (supabaseAdmin: SupabaseClient, testUser: User) => {
  await supabaseAdmin.auth.admin.deleteUser(testUser.id);
  await supabaseAdmin.from('person').delete().eq('user_id', testUser.id);
};
