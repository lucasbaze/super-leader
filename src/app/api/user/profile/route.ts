import { NextRequest, NextResponse } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { ContextSummary } from '@/services/context/schemas';
import { ApiResponse } from '@/types/api-response';
import type { UserProfile } from '@/types/database';
import { createClient } from '@/utils/supabase/server';

export type UserProfileResponse = UserProfile & {
  context_summary: ContextSummary | null;
};

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<UserProfile | null>>> {
  try {
    const supabase = await createClient();

    // Validate authentication
    const authResult = await validateAuthentication(supabase);
    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    // Get the user profile with context_summary
    const { data: profile, error: profileError } = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', authResult.data.id)
      .single();

    if (profileError) {
      return apiResponse.error(toError(profileError));
    }

    // For now, if there's no context summary, let's provide a placeholder
    if (!profile.context_summary) {
      profile.context_summary = {
        groupedSections: []
      };
    }

    return apiResponse.success(profile);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
