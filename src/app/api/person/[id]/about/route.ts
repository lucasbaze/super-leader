import { NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: person, error: personError } = await supabase.from('person').select('*').eq('id', params.id).single();

  if (personError) {
    return NextResponse.json({ error: personError.message }, { status: 500 });
  }

  const { data: contactMethods, error: contactError } = await supabase
    .from('contact_methods')
    .select('*')
    .eq('person_id', params.id);

  const { data: addresses, error: addressError } = await supabase
    .from('addresses')
    .select('*')
    .eq('person_id', params.id);

  const { data: websites, error: websiteError } = await supabase
    .from('websites')
    .select('*')
    .eq('person_id', params.id);

  if (contactError || addressError || websiteError) {
    return NextResponse.json({ error: 'Error fetching related data' }, { status: 500 });
  }

  return NextResponse.json({
    person,
    contactMethods,
    addresses,
    websites
  });
}
