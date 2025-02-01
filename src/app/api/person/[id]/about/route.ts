import { NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Await and validate id parameter
    const { id } = await Promise.resolve(params);

    const supabase = await createClient();

    const { data: person, error: personError } = await supabase
      .from('person')
      .select('*')
      .eq('id', id)
      .single();

    console.log('person & error', person, personError);

    if (personError) {
      return NextResponse.json({ error: personError.message }, { status: 500 });
    }

    const { data: contactMethods, error: contactError } = await supabase
      .from('contact_methods')
      .select('*')
      .eq('person_id', id);

    const { data: addresses, error: addressError } = await supabase
      .from('addresses')
      .select('*')
      .eq('person_id', id);

    const { data: websites, error: websiteError } = await supabase
      .from('websites')
      .select('*')
      .eq('person_id', id);

    if (contactError || addressError || websiteError) {
      return NextResponse.json({ error: 'Error fetching related data' }, { status: 500 });
    }

    return NextResponse.json({
      person,
      contactMethods,
      addresses,
      websites
    });
  } catch (error) {
    console.error('Error fetching person details:', error);
    
return NextResponse.json({ error: 'Failed to fetch person details' }, { status: 500 });
  }
}
