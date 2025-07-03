import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';
import { createServiceRoleClient } from '@/utils/supabase/service-role';

export const ERRORS = {
  AVATAR: {
    MISSING_USER_ID: createError(
      'missing_user_id',
      ErrorType.VALIDATION_ERROR,
      'User ID is required',
      'Please provide a user ID'
    ),
    UPLOAD_FAILED: createError(
      'avatar_upload_failed',
      ErrorType.DATABASE_ERROR,
      'Failed to upload avatar',
      'Unable to save avatar image'
    )
  }
};

export interface UpdateUserAvatarParams {
  db: DBClient;
  userId: string;
  bytes: Uint8Array;
  filename: string;
}

export async function updateUserAvatar({
  db,
  userId,
  bytes,
  filename
}: UpdateUserAvatarParams): Promise<ServiceResponse<string>> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.AVATAR.MISSING_USER_ID };
    }

    const supabase = await createServiceRoleClient();
    const path = `avatars/${userId}-${Date.now()}-${filename}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, bytes, { upsert: true, contentType: 'image/png' });

    if (uploadError) {
      const err = { ...ERRORS.AVATAR.UPLOAD_FAILED, details: uploadError };
      errorLogger.log(err);
      return { data: null, error: err };
    }

    const { error: updateError } = await db
      .from('user_profile')
      .update({ avatar_url: path })
      .eq('user_id', userId);

    if (updateError) {
      const err = { ...ERRORS.AVATAR.UPLOAD_FAILED, details: updateError };
      errorLogger.log(err);
      return { data: null, error: err };
    }

    return { data: path, error: null };
  } catch (error) {
    const err = { ...ERRORS.AVATAR.UPLOAD_FAILED, details: error };
    errorLogger.log(err);
    return { data: null, error: err };
  }
}
