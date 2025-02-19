import { SupabaseClient } from '@supabase/supabase-js';

import { RESERVED_GROUP_SLUGS } from '@/lib/groups/constants';
import { routes } from '@/lib/routes';
import { createTestGroup } from '@/tests/test-builder/create-group';
import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { ERRORS, getInitialMessages } from '../get-initial-message';
import { TMessageWithContent } from '../types';

describe('get-initial-message-service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    describe('static initial messages', () => {
      const testCases = [
        {
          path: routes.home(),
          description: 'home path',
          expectedLength: 2,
          expectedContent: ['Welcome to Superleader!']
        },
        {
          path: routes.people.root(),
          description: 'people path',
          expectedLength: 1,
          expectedContent: ['This is where everyone Superleader is tracking can be found.']
        },
        {
          path: routes.network.root(),
          description: 'network path',
          expectedLength: 2,
          expectedContent: ["What good is a goal if you don't track it"]
        },
        {
          path: routes.bookmarks.root(),
          description: 'bookmarks path',
          expectedLength: 1,
          expectedContent: ['Sometimes you find stuff']
        },
        {
          path: '/random-path',
          description: 'random path',
          expectedLength: 1,
          expectedContent: ['How can I help you?']
        }
      ];

      testCases.forEach(({ path, description, expectedLength, expectedContent }) => {
        it(`should return correct initial messages for ${description}`, async () => {
          await withTestTransaction(supabase, async (db) => {
            const testUser = await createTestUser({ db });

            const result = await getInitialMessages({
              db,
              userId: testUser.id,
              path
            });

            expect(result.error).toBeNull();
            expect(result.data).toHaveLength(expectedLength);
            expectedContent.forEach((content) => {
              expect(
                result.data?.some((msg) =>
                  (msg.message as TMessageWithContent)?.content?.includes(content)
                )
              ).toBe(true);
            });
          });
        });
      });
    });

    describe('person-specific messages', () => {
      it('should return personalized messages for person path', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const testPerson = await createTestPerson({
            db,
            data: { user_id: testUser.id, first_name: 'John', last_name: 'Doe' }
          });

          const result = await getInitialMessages({
            db,
            userId: testUser.id,
            path: routes.person.byId({ id: testPerson.id }),
            personId: testPerson.id
          });

          expect(result.error).toBeNull();
          expect(result.data).toHaveLength(2);
          expect(
            result.data?.some((msg) =>
              (msg.message as TMessageWithContent)?.content?.includes('John')
            )
          ).toBeTruthy();
        });
      });
    });

    describe('group-specific messages', () => {
      it('should return reserved group messages for inner-5', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const testGroup = await createTestGroup({
            db,
            data: {
              user_id: testUser.id,
              name: 'Inner 5',
              slug: RESERVED_GROUP_SLUGS.INNER_5
            }
          });

          const result = await getInitialMessages({
            db,
            userId: testUser.id,
            path: routes.groups.byId({ id: testGroup.id }),
            groupId: testGroup.id
          });

          expect(result.error).toBeNull();
          expect(result.data).toHaveLength(2);
          expect(
            result.data?.some((msg) =>
              (msg.message as TMessageWithContent)?.content?.includes('Inner 5')
            )
          ).toBeTruthy();
        });
      });

      it('should return custom group messages for non-reserved groups', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const testGroup = await createTestGroup({
            db,
            data: {
              user_id: testUser.id,
              name: 'Custom Group',
              slug: 'custom-group',
              icon: '🎯'
            }
          });

          const result = await getInitialMessages({
            db,
            userId: testUser.id,
            path: routes.groups.byId({ id: testGroup.id }),
            groupId: testGroup.id
          });

          expect(result.error).toBeNull();
          expect(result.data).toHaveLength(2);
          expect(
            result.data?.some((msg) =>
              (msg.message as TMessageWithContent)?.content?.includes(
                'Use this group 🎯 Custom Group'
              )
            )
          ).toBeTruthy();
        });
      });
    });
  });

  describe('error cases', () => {
    it('should return error when person not found', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const result = await getInitialMessages({
          db,
          userId: testUser.id,
          path: routes.person.byId({ id: 'non-existent-id' }),
          personId: 'non-existent-id'
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.FETCH_FAILED);
      });
    });

    it('should return error when group not found', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const result = await getInitialMessages({
          db,
          userId: testUser.id,
          path: routes.groups.byId({ id: 'non-existent-id' }),
          groupId: 'non-existent-id'
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.FETCH_FAILED);
      });
    });
  });
});
