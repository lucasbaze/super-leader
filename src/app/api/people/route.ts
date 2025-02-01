import { NextRequest, NextResponse } from 'next/server';

import { getPeople } from '@/services/people';
import { ServiceErrorType } from '@/types/service-response';
import { createClient } from '@/utils/supabase/server';

const errorStatusMap: Record<ServiceErrorType, number> = {
  [ServiceErrorType.NOT_FOUND]: 404,
  [ServiceErrorType.UNAUTHORIZED]: 401,
  [ServiceErrorType.VALIDATION_ERROR]: 400,
  [ServiceErrorType.DATABASE_ERROR]: 503,
  [ServiceErrorType.INTERNAL_ERROR]: 500
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call service method
    const result = await getPeople({ db: supabase, userId: user.id });

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message, details: result.error.details },
        { status: errorStatusMap[result.error.type] }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('API Error:', error);
    
return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
