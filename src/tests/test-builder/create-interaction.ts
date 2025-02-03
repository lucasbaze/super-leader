import { DBClient } from '@/types/database';

interface CreateTestInteractionParams {
  db: DBClient;
  data: {
    person_id: string;
    user_id: string;
    type: string;
    note: string;
  };
}

export async function createTestInteraction({ db, data }: CreateTestInteractionParams) {
  const { data: interaction, error } = await db
    .from('interactions')
    .insert({
      person_id: data.person_id,
      user_id: data.user_id,
      type: data.type,
      note: data.note
    })
    .select('*')
    .single();

  if (error) throw error;
  return interaction;
}
