import { ServiceErrorType } from '@/types/service-response';

export const errorStatusMap: Record<ServiceErrorType, number> = {
  [ServiceErrorType.NOT_FOUND]: 404,
  [ServiceErrorType.UNAUTHORIZED]: 401,
  [ServiceErrorType.VALIDATION_ERROR]: 400,
  [ServiceErrorType.DATABASE_ERROR]: 503,
  [ServiceErrorType.INTERNAL_ERROR]: 500
};
