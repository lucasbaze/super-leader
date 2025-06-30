import { task } from '@trigger.dev/sdk/v3';

import { JOBS } from '@/lib/jobs/constants';
import { importCSV } from '@/services/import/csv-import';
import { createServiceRoleClient } from '@/utils/supabase/service-role';

export const importContactsTask = task({
  id: JOBS.IMPORT_CONTACTS_CSV,
  run: async ({ userId, filePath }: { userId: string; filePath: string }) => {
    const supabase = await createServiceRoleClient();
    const result = await importCSV({ db: supabase, userId, filePath });
    if (result.error) {
      console.error('CSV import failed', result.error);
    }
    return result;
  }
});
