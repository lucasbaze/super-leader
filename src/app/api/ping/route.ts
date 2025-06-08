import { NextRequest, NextResponse } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { toError } from '@/lib/errors';
import { ApiResponse } from '@/types/api-response';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<string | null>>> {
  try {
    return apiResponse.success('pong');
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
