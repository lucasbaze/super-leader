import { NextResponse } from 'next/server';

import { ServiceError } from '@/types/service-response';

import { ErrorMessages, errorStatusMap } from './errors';

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  details?: unknown;
};

export const apiResponse = {
  success<T>(data: T) {
    return NextResponse.json(data);
  },

  error(message: string, status: number = 500, details?: unknown) {
    return NextResponse.json({ error: message, details }, { status });
  },

  serviceError(error: ServiceError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: errorStatusMap[error.type] }
    );
  },

  unauthorized() {
    return NextResponse.json({ error: ErrorMessages.UNAUTHORIZED }, { status: 401 });
  },

  internalError(error?: unknown) {
    if (error) console.error('API Error:', error);

    return NextResponse.json({ error: ErrorMessages.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
};
