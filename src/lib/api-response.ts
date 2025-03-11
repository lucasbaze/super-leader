import { NextResponse } from 'next/server';

import { errorLogger } from '@/lib/errors';
import { ApiResponse } from '@/types/api-response';
import { ErrorType, TError } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

const errorStatusMap: Record<ErrorType, number> = {
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.UNAUTHORIZED]: 401,
  [ErrorType.VALIDATION_ERROR]: 400,
  [ErrorType.DATABASE_ERROR]: 503,
  [ErrorType.INTERNAL_ERROR]: 500,
  [ErrorType.CONFLICT]: 409,
  [ErrorType.BAD_REQUEST]: 400,
  [ErrorType.FORBIDDEN]: 403,
  [ErrorType.NETWORK_ERROR]: 503,
  [ErrorType.TIMEOUT]: 408,
  [ErrorType.API_ERROR]: 500
};

export const apiResponse = {
  success<T>(data: T): NextResponse<ApiResponse<T>> {
    return NextResponse.json({ success: true, data, error: null });
  },

  error(error: TError): NextResponse<ApiResponse<never>> {
    errorLogger.log(error);

    return NextResponse.json(
      { success: false, data: null, error },
      { status: errorStatusMap[error.type] }
    );
  },

  validationError(error: TError): NextResponse<ApiResponse<never>> {
    return NextResponse.json(
      { success: false, data: null, error },
      { status: errorStatusMap[ErrorType.VALIDATION_ERROR] }
    );
  },

  unauthorized(error: TError): NextResponse<ApiResponse<never>> {
    return NextResponse.json(
      { success: false, data: null, error },
      { status: errorStatusMap[ErrorType.UNAUTHORIZED] }
    );
  }

  // // Function to create API response from service response
  // fromServiceResponse<T>(serviceResponse: ServiceResponse<T>): NextResponse {
  //   if (serviceResponse.error) {
  //     return this.error(serviceResponse.error);
  //   }
  //   return this.success(serviceResponse.data);
  // }
};
