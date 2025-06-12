import { task } from '@trigger.dev/sdk/v3';

import { JOBS } from '@/lib/jobs/constants';
import { createServiceRoleClient } from '@/utils/supabase/service-role';

import { syncLinkedInContacts } from '../services/unipile/sync-linkedin-contacts';

type LinkedInContactSyncPayload = {
  userId: string;
  accountId: string;
};

export const initialLinkedInContactSyncTask = task({
  id: JOBS.SYNC_LINKEDIN_CONTACTS,
  run: async (payload: LinkedInContactSyncPayload) => {
    const supabase = await createServiceRoleClient();
    const result = await syncLinkedInContacts({
      db: supabase,
      userId: payload.userId,
      accountId: payload.accountId
    });

    if (result.error) {
      console.error('Linkedin contacts sync completed with errors', {
        processedCount: result.data?.processed.count,
        createdCount: result.data?.created.count,
        updatedCount: result.data?.updated.count,
        skippedCount: result.data?.skipped.count,
        errors: result.error
      });
    } else {
      console.log('Linkedin contacts sync completed successfully', {
        processedCount: result.data?.processed.count,
        createdCount: result.data?.created.count,
        updatedCount: result.data?.updated.count,
        skippedCount: result.data?.skipped.count
      });
    }

    return result;
  }
});
