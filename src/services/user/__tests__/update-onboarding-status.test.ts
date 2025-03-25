import { SupabaseClient } from '@supabase/supabase-js';

import { createTestUser, createTestUserProfile } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { getUserProfile } from '../get-user-profile';
import { Onboarding } from '../types';
import { ERRORS, updateOnboardingStatus } from '../update-onboarding-status';

describe('updateOnboardingStatus', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should update a specific step status', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user
        const { id: userId } = await createTestUser({ db });
        await createTestUserProfile({
          db,
          data: { user_id: userId, first_name: 'Test', last_name: 'User' }
        });

        // Initial state check
        const userProfile = await getUserProfile({ db, userId });
        const onboarding = userProfile.data?.onboarding as Onboarding;
        expect(onboarding.steps.shareValueAsk.completed).toBe(false);

        // Update step status
        const result = await updateOnboardingStatus({
          db,
          userId,
          stepsCompleted: ['personal']
        });

        // Verify update
        expect(result.data).toBe(true);
        expect(result.error).toBeNull();

        // Verify updated state
        const updatedUserProfile = await getUserProfile({ db, userId });
        const updatedOnboarding = updatedUserProfile.data?.onboarding as Onboarding;
        expect(updatedOnboarding.steps.personal.completed).toBe(true);
        expect(updatedOnboarding.completed).toBe(false);
      });
    });

    it.only('should update multiple steps status', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user
        const { id: userId } = await createTestUser({ db });
        await createTestUserProfile({
          db,
          data: { user_id: userId, first_name: 'Test', last_name: 'User' }
        });

        // Initial state check
        const userProfile = await getUserProfile({ db, userId });
        const onboarding = userProfile.data?.onboarding as Onboarding;
        expect(onboarding.steps.shareValueAsk.completed).toBe(false);
        expect(onboarding.steps.values.completed).toBe(false);

        // Update multiple steps status
        const result = await updateOnboardingStatus({
          db,
          userId,
          stepsCompleted: ['shareValueAsk', 'values']
        });

        // Verify update
        expect(result.data).toBe(true);
        expect(result.error).toBeNull();

        // Verify updated state
        const updatedUserProfile = await getUserProfile({ db, userId });
        const updatedOnboarding = updatedUserProfile.data?.onboarding as Onboarding;
        expect(updatedOnboarding.steps.values.completed).toBe(true);
        expect(updatedOnboarding.steps.shareValueAsk.completed).toBe(true);
        expect(updatedOnboarding.completed).toBe(false);
      });
    });

    it('should mark onboarding as completed', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user
        const { id: userId } = await createTestUser({ db });
        await createTestUserProfile({
          db,
          data: { user_id: userId, first_name: 'Test', last_name: 'User' }
        });

        // Initial state check
        const userProfile = await getUserProfile({ db, userId });
        const onboarding = userProfile.data?.onboarding as Onboarding;
        expect(onboarding.completed).toBe(false);

        // Update onboarding status
        const result = await updateOnboardingStatus({
          db,
          userId,
          onboardingCompleted: true
        });

        // Verify update
        expect(result.data).toBe(true);
        expect(result.error).toBeNull();

        // Verify updated state
        const updatedUserProfile = await getUserProfile({ db, userId });
        const updatedOnboarding = updatedUserProfile.data?.onboarding as Onboarding;
        expect(updatedOnboarding.steps).toBeDefined();
        expect(updatedOnboarding.completed).toBe(true);
      });
    });
  });

  describe('error cases', () => {
    it('should return error when database update fails', async () => {
      // Use a non-existent userId to force an error
      const result = await updateOnboardingStatus({
        db: null as any, // Force error
        userId: 'non-existent-user'
      });

      expect(result.data).toBeNull();
      expect(result.error?.name).toBe(ERRORS.UPDATE.name);
    });
  });
});
