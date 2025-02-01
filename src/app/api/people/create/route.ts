import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { first_name, last_name, note, date_met } = body;

    // Start a transaction to create both person and interaction
    const { data: person, error: personError } = await supabase
      .from('person')
      .insert({
        first_name,
        last_name,
        date_met,
        user_id: user.id
      })
      .select()
      .single();

    if (personError) throw personError;

    if (note) {
      const { error: interactionError } = await supabase.from('interactions').insert({
        person_id: person.id,
        note,
        type: 'meeting',
        user_id: user.id
      });

      if (interactionError) throw interactionError;
    }

    return NextResponse.json({ success: true, person });
  } catch (error) {
    console.error('Error creating person:', error);

    return NextResponse.json({ error: 'Failed to create person' }, { status: 500 });
  }
}
