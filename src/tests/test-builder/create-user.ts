// utils/createTestUser.js
import { randomUUID } from 'crypto';

import { DBClient } from '@/types/database';

interface CreateTestUserInput {
  db: DBClient;
  data?: {
    email?: string;
    password?: string;
  };
}

export async function createTestUser({ db, data }: CreateTestUserInput) {
  const defaultEmail = `testy_${randomUUID()}@superleader.ai`;
  const defaultPassword = 'Password1!';

  const { data: userData, error } = await db.auth.admin.createUser({
    email: data?.email ?? defaultEmail,
    password: data?.password ?? defaultPassword,
    email_confirm: true // Skip email confirmation for testing
  });

  if (error) throw error;

  return userData.user;
}
