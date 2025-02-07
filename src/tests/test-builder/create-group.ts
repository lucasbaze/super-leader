import { DBClient, Group } from '@/types/database';

interface CreateTestGroupParams {
  db: DBClient;
  data: {
    user_id: string;
    name: string;
    slug: string;
    icon?: string;
  };
}

export async function createTestGroup({ db, data }: CreateTestGroupParams): Promise<Group> {
  const { data: group, error } = await db
    .from('group')
    .insert({
      user_id: data.user_id,
      name: data.name,
      slug: data.slug,
      icon: data.icon || 'default-icon'
    })
    .select('*')
    .single();

  if (error) throw error;
  if (!group) throw new Error('Failed to create test group');

  return group;
}
