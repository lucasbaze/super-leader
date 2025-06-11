import { NextRequest, NextResponse } from 'next/server';

import { apiResponse } from '@/lib/api-response';
import { validateAuthentication } from '@/lib/auth/validate-authentication';
import { toError } from '@/lib/errors';
import { ContextSummary } from '@/services/context/schemas';
import { getUserProfile } from '@/services/user/get-user-profile';
import { updateOnboardingStatus } from '@/services/user/update-onboarding-status';
import { ApiResponse } from '@/types/api-response';
import type { UserProfile } from '@/types/database';
import { createClient } from '@/utils/supabase/server';

export type UserProfileResponse = UserProfile & {
  context_summary: ContextSummary | null;
};

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<UserProfile | null>>> {
  try {
    const supabase = await createClient();

    // Validate authentication
    const authResult = await validateAuthentication(supabase);
    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    console.log('authResult', authResult.data.id);

    const { data: profile, error: profileError } = await getUserProfile({
      db: supabase,
      userId: authResult.data.id
    });

    if (profileError) {
      return apiResponse.error(toError(profileError));
    }

    // For now, if there's no context summary, let's provide a placeholder
    if (profile && !profile.context_summary) {
      profile.context_summary = {
        groupedSections: [],
        completeness: 0,
        followUpQuestions: []
      };
    }

    return apiResponse.success(profile);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse<ApiResponse<boolean | null>>> {
  try {
    const supabase = await createClient();

    // Validate authentication
    const authResult = await validateAuthentication(supabase);
    if (authResult.error || !authResult.data) {
      return apiResponse.unauthorized(toError(authResult.error));
    }

    const { data, error } = await updateOnboardingStatus({
      db: supabase,
      userId: authResult.data.id,
      onboardingCompleted: true
    });

    if (error) {
      return apiResponse.error(error);
    }

    return apiResponse.success(data);
  } catch (error) {
    return apiResponse.error(toError(error));
  }
}
