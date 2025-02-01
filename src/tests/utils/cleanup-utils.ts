import { DBClient } from '@/types/database';

interface CleanupUserDataParams {
  db: DBClient;
  testUserId: string;
}

export const cleanupUserData = async ({ db, testUserId }: CleanupUserDataParams) => {
  try {
    if (db.auth?.admin) {
      await db.auth.admin.deleteUser(testUserId);
    }
    await db.from('person').delete().eq('user_id', testUserId);
  } catch (error) {
    console.error('Error cleaning up test user:', error);
  }
};

export const cleanupAllTestUsers = async (db: DBClient) => {
  try {
    const { data: users, error } = await db.auth.admin.listUsers();

    if (error) {
      console.error('Error fetching users:', error);
      
return;
    }

    const testUsers = users.users.filter((user) => user.email?.startsWith('testy_'));

    for (const user of testUsers) {
      await cleanupUserData({ db, testUserId: user.id });
    }

    console.log(`Cleaned up ${testUsers.length} test users`);
  } catch (error) {
    console.error('Error cleaning up test users:', error);
  }
};
