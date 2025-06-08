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
      console.error('Email sync completed with errors', {
        processed: result.data?.processed,
        created: result.data?.created,
        updated: result.data?.updated,
        skipped: result.data?.skipped,
        errors: result.error
      });
    } else {
      console.log('Email sync completed successfully', {
        processed: result.data?.processed,
        created: result.data?.created,
        updated: result.data?.updated,
        skipped: result.data?.skipped
      });
    }

    return result;
  }
});
