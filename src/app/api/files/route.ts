import { NextRequest } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { createFile } from '@/services/files/create-file';
import { getFiles } from '@/services/files/get-files';
import { importContactsTask } from '@/trigger/import-contacts';
import { createClient } from '@/utils/supabase/server';
import { createServiceRoleClient } from '@/utils/supabase/service-role';

export async function GET(req: NextRequest) {
  const db = await createClient();
  const authResult = await validateAuthentication(db);
  if (authResult.error || !authResult.data) {
    return apiResponse.unauthorized(toError(authResult.error));
  }
  const result = await getFiles({ db, userId: authResult.data.id });
  if (result.error) return apiResponse.error(result.error);
  return apiResponse.success(result.data);
}

export async function POST(req: NextRequest) {
  const db = await createClient();
  const authResult = await validateAuthentication(db);
  if (authResult.error || !authResult.data) {
    return apiResponse.unauthorized(toError(authResult.error));
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return apiResponse.validationError(toError(new Error('File missing')));
  }

  const arrayBuffer = await file.arrayBuffer();
  const path = `uploads/${Date.now()}-${file.name}`;
  try {
    const supabase = await createServiceRoleClient();
    await supabase.storage.from('imports').upload(path, arrayBuffer);
  } catch (error) {
    console.error('Error uploading file', error);
    return apiResponse.error(toError(error));
  }

  const result = await createFile({
    db,
    data: {
      name: file.name,
      path,
      user_id: authResult.data.id
    }
  });

  if (result.error || !result.data) {
    return apiResponse.error(result.error || toError(new Error('Failed to create file record')));
  }

  await importContactsTask.trigger(
    { userId: authResult.data.id, filePath: path },
    { tags: [`user:${authResult.data.id}`] }
  );

  return apiResponse.success(result.data);
}
