import { apiResponse } from '@/lib/api-response';
import { toError } from '@/lib/errors';
import { updateAISummary } from '@/services/summary/update-ai-summary';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id: personId } = await params;

    const result = await updateAISummary({
      db: supabase,
      personId
    });

    if (result.error) {
      throw result.error;
    }

    return apiResponse.success(result.data);
  } catch (error) {
    console.error('API::Person::Summary::Error', error);
    return apiResponse.error(toError(error));
  }
}
