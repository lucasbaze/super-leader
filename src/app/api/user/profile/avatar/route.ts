import { NextRequest } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { updateUserAvatar } from '@/services/user/update-user-avatar';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const authResult = await validateAuthentication(supabase);
  if (authResult.error || !authResult.data) {
    return apiResponse.unauthorized(toError(authResult.error));
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return apiResponse.validationError(toError(new Error('File missing')));
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const result = await updateUserAvatar({
    db: supabase,
    userId: authResult.data.id,
    bytes,
    filename: file.name
  });

  if (result.error) return apiResponse.error(result.error);
  return apiResponse.success(result.data);
}
