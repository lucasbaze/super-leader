import { NextRequest } from 'next/server';

import { UnipileClient } from 'unipile-node-sdk';

import { apiResponse } from '@/lib/api-response';
import { ErrorType } from '@/types/errors';

export async function POST(request: NextRequest) {
  try {
    // Validate required environment variables
    if (!process.env.UNIPILE_DSN || !process.env.UNIPILE_API_KEY) {
      return apiResponse.error({
        name: 'missing_unipile_config',
        type: ErrorType.INTERNAL_ERROR,
        message: 'Missing required Unipile configuration',
        displayMessage: 'Integration configuration is incomplete. Please contact support.'
      });
    }

    // Create Unipile client
    const client = new UnipileClient(`https://${process.env.UNIPILE_DSN}`, `${process.env.UNIPILE_API_KEY}`);

    // Create hosted auth link
    const result = await client.users.getAllRelations({
      account_id: 'Mv-7fxB7QsmpPvIFD4cA2A',
      limit: 10
      // cursor: 'eyJsaW1pdCI6NTAsInN0YXJ0SW5kZXgiOjUwfQ=='
    });
    console.log('result', result);

    return apiResponse.success(result);
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

// For each contact that's returned, we need to find the person or create a new person.
// cursor eyJsaW1pdCI6NTAsInN0YXJ0SW5kZXgiOjUwfQ==
// cursor eyJsaW1pdCI6NTAsInN0YXJ0SW5kZXgiOjUwfQ==
// cursor eyJsaW1pdCI6MTAsInN0YXJ0SW5kZXgiOjEwfQ==
