import { z } from 'zod';

import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { DBClient, File } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const createFileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  path: z.string().min(1, 'File path is required'),
  user_id: z.string().min(1, 'User ID is required')
});

export type CreateFileParams = z.infer<typeof createFileSchema>;

export const ERRORS = {
  FILES: {
    VALIDATION_ERROR: createError(
      'file_validation_error',
      ErrorType.VALIDATION_ERROR,
      'Invalid file data',
      'Please provide valid file information'
    ),
    CREATE_FAILED: createError(
      'file_create_failed',
      ErrorType.DATABASE_ERROR,
      'Failed to create file record',
      'Unable to save file information'
    )
  }
};

export type CreateFileServiceResult = ServiceResponse<File>;

export async function createFile({
  db,
  data
}: {
  db: DBClient;
  data: CreateFileParams;
}): Promise<CreateFileServiceResult> {
  try {
    const validationResult = createFileSchema.safeParse(data);

    if (!validationResult.success) {
      const serviceError = {
        ...ERRORS.FILES.VALIDATION_ERROR,
        details: validationResult.error.format()
      };
      errorLogger.log(serviceError);
      return { data: null, error: serviceError };
    }

    const { name, path, user_id } = validationResult.data;

    const { data: file, error: fileError } = await db
      .from('files')
      .insert({
        name,
        path,
        user_id
      })
      .select()
      .single();

    if (fileError || !file) {
      const serviceError = {
        ...ERRORS.FILES.CREATE_FAILED,
        details: fileError
      };
      errorLogger.log(serviceError);
      return { data: null, error: serviceError };
    }

    return { data: file, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.FILES.CREATE_FAILED,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
