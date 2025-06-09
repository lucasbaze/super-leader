import { task } from '@trigger.dev/sdk/v3';

import { JOBS } from '@/lib/jobs/constants';
import { createServiceRoleClient } from '@/utils/supabase/service-role';

import { syncLinkedInContacts } from '../services/unipile/sync-linkedin-contacts';

type EmailSyncPayload = {
  userId: string;
  accountId: string;
};

export const linkedInContactSyncTask = task({
  id: JOBS.SYNC_LINKEDIN_CONTACTS,
  // trigger: {
  //   type: 'cron',
  //   cron: '0 */2 * * *' // Run every 2 hours
  // },
  run: async (payload: EmailSyncPayload) => {
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
        created: JSON.stringify(result.data?.created.record),
        updatedCount: result.data?.updated.count,
        updated: JSON.stringify(result.data?.updated.record),
        skippedCount: result.data?.skipped.count,
        skipped: JSON.stringify(result.data?.skipped.record),
        errors: result.error
      });
    } else {
      console.log('Linkedin contacts sync completed successfully', {
        processedCount: result.data?.processed.count,
        createdCount: result.data?.created.count,
        created: JSON.stringify(result.data?.created.record),
        updatedCount: result.data?.updated.count,
        updated: JSON.stringify(result.data?.updated.record),
        skippedCount: result.data?.skipped.count,
        skipped: JSON.stringify(result.data?.skipped.record)
      });
    }

    return result;
  }
});
