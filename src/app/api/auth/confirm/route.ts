// pages/api/auth/confirm.ts
import { NextResponse } from 'next/server';

import { ROUTES } from '@/lib/routes';
import { absoluteUrl } from '@/lib/utils/absolute-url';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
  const supabase = await createClient();
  const url = new URL(req.url);

  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');

  if (!token_hash || type !== 'email') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Here is were we verify the token_hash so that our users
  // will later be able to update their password.
  const {
    data: { session },
    error
  } = await supabase.auth.verifyOtp({ token_hash, type });

  console.log('session', session);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Redirect to the specified URL which in our case is
  // the app/update-password/page.tsx, where users will set the new password
  // after they have been authenticated using the verifyOtp method
  return NextResponse.redirect(absoluteUrl(ROUTES.UPDATE_PASSWORD));
}
