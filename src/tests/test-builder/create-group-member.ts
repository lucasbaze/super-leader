import { DBClient, GroupMember } from '@/types/database';

interface CreateTestGroupMemberParams {
  db: DBClient;
  data: {
    group_id: string;
    person_id: string;
    user_id: string;
  };
}

export async function createTestGroupMember({
  db,
  data
}: CreateTestGroupMemberParams): Promise<GroupMember> {
  const { data: groupMember, error } = await db
    .from('group_member')
    .insert({
      group_id: data.group_id,
      person_id: data.person_id,
      user_id: data.user_id
    })
    .select('*')
    .single();

  if (error) throw error;
  if (!groupMember) throw new Error('Failed to create test group member');

  return groupMember;
}
