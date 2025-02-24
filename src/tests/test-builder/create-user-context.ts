import { DBClient } from '@/types/database';

interface CreateTestUserContextParams {
  db: DBClient;
  data: {
    user_id: string;
    content: string;
    reason: string;
    processed?: boolean;
    processed_at?: string | null;
  };
}

export async function createTestUserContext({ db, data }: CreateTestUserContextParams) {
  const { data: userContext, error } = await db
    .from('user_context')
    .insert({
      user_id: data.user_id,
      content: data.content,
      reason: data.reason,
      processed: data.processed ?? false,
      processed_at: data.processed_at || null
    })
    .select('*')
    .single();

  if (error) throw error;
  return userContext;
}
