import { TError } from '@/types/errors';

export const errorLogger = {
  log: (error: TError, context?: Record<string, unknown>) => {
    // TODO: Replace with actual logging service
    console.error('Error:', {
      error,
      ...context,
      timestamp: new Date().toISOString()
    });
  }
};
