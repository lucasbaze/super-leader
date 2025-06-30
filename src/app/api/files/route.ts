import { NextRequest } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { getFiles } from '@/services/files/get-files';
import { importContactsTask } from '@/trigger/import-contacts';
import { createClient } from '@/utils/supabase/server';

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

  // Placeholder upload logic - actual Supabase storage integration needed
  const arrayBuffer = await file.arrayBuffer();
  const path = `uploads/${Date.now()}-${file.name}`;
  await db.storage.from('imports').upload(path, arrayBuffer);

  const { data, error } = await db
    .from('files')
    .insert({ name: file.name, path, user_id: authResult.data.id })
    .select()
    .single();

  if (error || !data) return apiResponse.error(toError(error));

  await importContactsTask.trigger(
    { userId: authResult.data.id, filePath: path },
    { tags: [`user:${authResult.data.id}`] }
  );

  return apiResponse.success(data);
}
