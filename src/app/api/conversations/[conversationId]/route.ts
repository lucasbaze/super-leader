import { NextRequest } from 'next/server';

import { z } from 'zod';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { updateConversation } from '@/services/conversations/update-conversation';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

const updateConversationSchema = z.object({
  name: z.string().min(1, 'Name is required')
});

export type UpdateConversationRequest = z.infer<typeof updateConversationSchema>;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const supabase = await createClient();
    const authResult = await validateAuthentication(supabase);

    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    const body = await request.json();
    const validationResult = updateConversationSchema.safeParse(body);

    if (!validationResult.success) {
      return apiResponse.validationError(toError(validationResult.error));
    }

    const { conversationId } = await Promise.resolve(params);

    const result = await updateConversation({
      db: supabase,
      conversationId,
      ...validationResult.data,
      userId: authResult.data.id
    });

    if (result.error) {
      return apiResponse.error(result.error);
    }

    return apiResponse.success(result.data);
  } catch (error) {
    return apiResponse.error({
      name: 'update_conversation_error',
      type: ErrorType.DATABASE_ERROR,
      message: 'Failed to update conversation',
      displayMessage: 'Unable to update conversation'
    });
  }
}
