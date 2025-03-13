import { NextRequest, NextResponse } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { personEditSchema } from '@/lib/schemas/person-edit';
import {
  updatePersonAddress,
  updatePersonContactMethod,
  updatePersonDetails,
  updatePersonField,
  updatePersonWebsite
} from '@/services/person/update-person-details';
import { createClient } from '@/utils/supabase/server';

// Helper to determine update type and validate data
function determineUpdateType(data: any) {
  if (data.field && 'value' in data) {
    return 'field';
  }
  if (data.contactMethod) {
    return 'contactMethod';
  }
  if (data.address) {
    return 'address';
  }
  if (data.website) {
    return 'website';
  }
  return 'full';
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const data = await request.json();

    const authResult = await validateAuthentication(supabase);
    if (authResult.error) {
      return apiResponse.unauthorized(authResult.error);
    }

    // Await and validate id parameter
    const { id } = await Promise.resolve(params);

    // Determine update type and handle accordingly
    const updateType = determineUpdateType(data);
    let error;

    switch (updateType) {
      case 'field':
        ({ error } = await updatePersonField({
          db: supabase,
          personId: id,
          field: data.field,
          value: data.value
        }));
        break;

      case 'contactMethod':
        ({ error } = await updatePersonContactMethod({
          db: supabase,
          personId: id,
          methodId: data.contactMethod.id,
          data: data.contactMethod
        }));
        break;

      case 'address':
        ({ error } = await updatePersonAddress({
          db: supabase,
          personId: id,
          addressId: data.address.id,
          data: data.address
        }));
        break;

      case 'website':
        ({ error } = await updatePersonWebsite({
          db: supabase,
          personId: id,
          websiteId: data.website.id,
          data: data.website
        }));
        break;

      case 'full':
      default: // Validate the incoming data for full updates
      {
        const validated = personEditSchema.parse(data);
        ({ error } = await updatePersonDetails({
          db: supabase,
          personId: id,
          data: validated
        }));
        break;
      }
    }

    if (error) throw error;

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error updating person details:', error);

    return new NextResponse(JSON.stringify({ error: 'Failed to update person details' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
