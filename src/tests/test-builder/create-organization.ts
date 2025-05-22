import { DBClient } from '@/types/database';

type CreateTestOrganizationParams = {
  db: DBClient;
  data: {
    user_id: string;
    name: string;
    url: string;
  };
};

export async function createTestOrganization({ db, data }: CreateTestOrganizationParams) {
  const { data: organization, error } = await db
    .from('organization')
    .insert({
      user_id: data.user_id,
      name: data.name,
      url: data.url
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating test organization:', error);
    throw new Error(`Failed to create test organization: ${error.message}`);
  }

  if (!organization) {
    throw new Error('No organization returned after creation');
  }

  return organization;
}
