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
  // trigger: {
  //   type: 'cron',
  //   cron: '0 */2 * * *' // Run every 2 hours
  // },
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

// To create the periodic sync task:
/*

- This task will run on a cron schedule of every 8 hours.
- The core method will need to gather all users that have a linkedin account connection.
- Then it will create a sync task for each user to sync and fetch like 100 contacts, but then stop it there. We can "not" batch this one, so that it doesn't trigger any automation issues. 
- This will be at a random time between 1 & 4 hours from the time the task is generated.

OR

At first, we can just make this a manual "Re-sync" button in the UI for now. Let's do that first since we're still in MVP land.

*/
