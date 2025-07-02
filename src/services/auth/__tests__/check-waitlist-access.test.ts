import { SupabaseClient } from '@supabase/supabase-js';

import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { checkWaitlistAccess, ERRORS } from '../check-waitlist-access';

describe('checkWaitlistAccess', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('returns access granted for enabled waitlist email', async () => {
      await withTestTransaction(supabase, async (db) => {
        const email = 'enabled@test.com';

        // Insert enabled waitlist entry
        await db.from('waitlist').insert({
          email,
          enabled: true
        });

        const result = await checkWaitlistAccess({
          db,
          email
        });

        expect(result.error).toBeNull();
        expect(result.data).toEqual({
          hasAccess: true,
          isOnWaitlist: true
        });
      });
    });

    it('returns access denied for disabled waitlist email', async () => {
      await withTestTransaction(supabase, async (db) => {
        const email = 'disabled@test.com';

        // Insert disabled waitlist entry
        await db.from('waitlist').insert({
          email,
          enabled: false
        });

        const result = await checkWaitlistAccess({
          db,
          email
        });

        expect(result.error).toBeNull();
        expect(result.data).toEqual({
          hasAccess: false,
          isOnWaitlist: true
        });
      });
    });

    it('returns access denied for email not on waitlist', async () => {
      await withTestTransaction(supabase, async (db) => {
        const email = 'notinwaitlist@test.com';

        const result = await checkWaitlistAccess({
          db,
          email
        });

        expect(result.error).toBeNull();
        expect(result.data).toEqual({
          hasAccess: false,
          isOnWaitlist: false
        });
      });
    });

    it('handles case insensitive email matching', async () => {
      await withTestTransaction(supabase, async (db) => {
        const email = 'CaSeInSeNsItIvE@test.com';

        // Insert with lowercase
        await db.from('waitlist').insert({
          email: email.toLowerCase(),
          enabled: true
        });

        // Check with mixed case
        const result = await checkWaitlistAccess({
          db,
          email
        });

        expect(result.error).toBeNull();
        expect(result.data).toEqual({
          hasAccess: true,
          isOnWaitlist: true
        });
      });
    });
  });

  describe('error cases', () => {
    it('handles invalid email', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await checkWaitlistAccess({
          db,
          email: 'invalid-email'
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.VALIDATION_ERROR);
      });
    });

    it('handles empty email', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await checkWaitlistAccess({
          db,
          email: ''
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.VALIDATION_ERROR);
      });
    });
  });
});
