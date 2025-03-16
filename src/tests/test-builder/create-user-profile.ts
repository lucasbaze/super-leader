import { DBClient } from '@/types/database';

interface CreateTestUserProfileParams {
  db: DBClient;
  data: {
    user_id: string;
    first_name: string;
    last_name: string;
    context_summary?: any;
    context_summary_completeness_score?: number;
    onboarding?: any;
  };
}

export async function createTestUserProfile({ db, data }: CreateTestUserProfileParams) {
  const { data: profile, error } = await db
    .from('user_profile')
    .insert({
      user_id: data.user_id,
      first_name: data.first_name,
      last_name: data.last_name,
      context_summary: data.context_summary || null,
      context_summary_completeness_score: data.context_summary_completeness_score || 0,
      onboarding: data.onboarding
    })
    .select('*')
    .single();

  if (error) throw error;
  return profile;
}
