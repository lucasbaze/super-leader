import { SuperError } from '@/types/errors';

export const errorLogger = {
  log: (error: SuperError, context?: Record<string, unknown>) => {
    // TODO: Replace with actual logging service
    console.error('Error:', {
      error,
      ...context,
      timestamp: new Date().toISOString()
    });
  }
};
