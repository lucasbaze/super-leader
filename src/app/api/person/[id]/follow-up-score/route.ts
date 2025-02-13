import { apiResponse } from '@/lib/api-response';
import { toError } from '@/lib/errors';
import { updateFollowUpScore } from '@/services/person/update-follow-up-score';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id: personId } = await params;
    const { manualScore } = await request.json();

    const result = await updateFollowUpScore({
      db: supabase,
      personId,
      manualScore
    });

    if (result.error) {
      throw result.error;
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
