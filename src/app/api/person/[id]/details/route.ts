import { NextRequest, NextResponse } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { personEditSchema } from '@/lib/schemas/person-edit';
import { updatePersonDetails } from '@/services/person/update-person-details';
import { createClient } from '@/utils/supabase/server';

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

    // Validate the incoming data
    const validated = personEditSchema.parse(data);

    // Start a transaction to update all related data
    const { error } = await updatePersonDetails({
      db: supabase,
      personId: id,
      data: validated
    });

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
