import { DBClient } from '@/types/database';

export async function withTestTransaction(db: DBClient, callback: (db: DBClient) => Promise<void>) {
  try {
    // Start transaction
    await db.rpc('begin_test_transaction');

    // Run the test
    await callback(db);
  } finally {
    // Always rollback the transaction
    await db.rpc('rollback_test_transaction');
  }
}
