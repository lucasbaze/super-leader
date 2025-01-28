import { NextResponse } from 'next/server';

import { Database } from '@/types/database';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        console.log('Getting people');
        const supabase = await createClient();

        // Get authenticated user
        const {
            data: { user }
        } = await supabase.auth.getUser();
        console.log(user);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get people for the authenticated user
        const { data: people, error } = await supabase
            .from('person')
            .select('*')
            .eq('user_id', user.id)
            .order('first_name', { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(people);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
