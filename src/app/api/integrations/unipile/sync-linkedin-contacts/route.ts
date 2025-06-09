import { NextRequest } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { linkedInContactSyncTask } from '@/trigger/linkedin-contact-sync';
import { ErrorType } from '@/types/errors';

export async function POST(request: NextRequest) {
  try {
    await linkedInContactSyncTask.trigger(
      {
        userId: 'c86eb445-a7cd-44c1-a0e0-3dd661ebb526',
        accountId: 'Mv-7fxB7QsmpPvIFD4cA2A'
      },
      {
        tags: ['user:c86eb445-a7cd-44c1-a0e0-3dd661ebb526']
      }
    );

    return apiResponse.success({
      message: 'Syncing LinkedIn contacts background task triggered'
    });
  } catch (error) {
    return apiResponse.error({
      name: 'fetch_unipile_contacts_error',
      type: ErrorType.INTERNAL_ERROR,
      message: 'Failed to fetch contacts',
      displayMessage: 'Unable to fetch contacts at this time',
      details: error
    });
  }
}
