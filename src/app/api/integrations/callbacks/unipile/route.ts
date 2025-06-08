import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Unipile Callback Called');
    const body = await request.json();
    console.log('Body:', body);
    const { status, account_id, name } = body;
    // Log the relevant values
    console.log('[Unipile Callback]', { status, account_id, name });
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('[Unipile Callback] Error parsing body', error);
    return new Response(null, { status: 400 });
  }
}
