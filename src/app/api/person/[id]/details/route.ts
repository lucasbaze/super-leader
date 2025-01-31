import { NextRequest, NextResponse } from 'next/server';

import { personEditSchema } from '@/lib/schemas/person-edit';
import { createClient } from '@/utils/supabase/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const data = await request.json();

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await and validate id parameter
    const { id } = await Promise.resolve(params);

    // Validate the incoming data
    const validated = personEditSchema.parse(data);

    // Start a transaction to update all related data
    const { error } = await supabase.rpc('update_person_details', {
      p_person_id: id,
      p_bio: validated.bio,
      p_contact_methods: validated.contactMethods,
      p_addresses: validated.addresses,
      p_websites: validated.websites
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
