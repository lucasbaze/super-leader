import {
  createTestGroup,
  createTestGroupMember,
  createTestPerson,
  createTestUser
} from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { AuthUser, DBClient } from '@/types/database';
import { createClient } from '@/utils/supabase/server';

import { ERRORS, getNetworkCompleteness } from '../get-network-completeness';

describe('getNetworkCompleteness service', () => {
  let supabase: DBClient;
  let testUser: AuthUser;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should calculate correct completeness averages for all groups', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user
        testUser = await createTestUser({ db });

        // Create the reserved groups
        const inner5Group = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Inner 5',
            slug: 'inner-5'
          }
        });

        const central50Group = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Central 50',
            slug: 'central-50'
          }
        });

        const strategic100Group = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Strategic 100',
            slug: 'strategic-100'
          }
        });

        // Create people for Inner 5 with completeness scores of 80
        const inner5People = [];
        for (let i = 0; i < 4; i++) {
          const person = await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: `Inner${i}`,
              last_name: 'Person',
              completeness_score: 80
            }
          });
          inner5People.push(person);

          // Add to Inner 5 group
          await createTestGroupMember({
            db,
            data: {
              group_id: inner5Group.id,
              person_id: person.id,
              user_id: testUser.id
            }
          });
        }

        // Create people for Central 50 with completeness scores of 60
        const central50People = [];
        for (let i = 0; i < 4; i++) {
          const person = await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: `Central${i}`,
              last_name: 'Person',
              completeness_score: 60
            }
          });
          central50People.push(person);

          // Add to Central 50 group
          await createTestGroupMember({
            db,
            data: {
              group_id: central50Group.id,
              person_id: person.id,
              user_id: testUser.id
            }
          });
        }

        // Create people for Strategic 100 with completeness scores of 40
        const strategic100People = [];
        for (let i = 0; i < 4; i++) {
          const person = await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: `Strategic${i}`,
              last_name: 'Person',
              completeness_score: 40
            }
          });
          strategic100People.push(person);

          // Add to Strategic 100 group
          await createTestGroupMember({
            db,
            data: {
              group_id: strategic100Group.id,
              person_id: person.id,
              user_id: testUser.id
            }
          });
        }

        // Create people for Everyone Else with completeness scores of 20
        const everyoneElsePeople = [];
        for (let i = 0; i < 8; i++) {
          const person = await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: `Everyone${i}`,
              last_name: 'Person',
              completeness_score: 20
            }
          });
          everyoneElsePeople.push(person);
          // These people are not added to any group
        }

        // Call the service
        const result = await getNetworkCompleteness({
          db,
          userId: testUser.id
        });

        // Verify results
        expect(result.error).toBeNull();
        expect(result.data).not.toBeNull();

        if (result.data) {
          // Inner 5 should be 80 (average of 80, 80, 80, 80)
          expect(result.data.inner5).toBe(80);

          // Central 50 should be 60 (average of 60, 60, 60, 60)
          expect(result.data.central50).toBe(60);

          // Strategic 100 should be 40 (average of 40, 40, 40, 40)
          expect(result.data.strategic100).toBe(40);

          // Everyone should be 20 (average of only the 8 people not in core groups)
          expect(result.data.everyone).toBe(20);
        }
      });
    });

    it('should handle empty groups correctly', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user
        testUser = await createTestUser({ db });

        // Create the reserved groups but don't add any people
        await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Inner 5',
            slug: 'inner-5'
          }
        });

        await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Central 50',
            slug: 'central-50'
          }
        });

        await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Strategic 100',
            slug: 'strategic-100'
          }
        });

        // Create a few people but don't add them to any groups
        for (let i = 0; i < 3; i++) {
          await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: `Person${i}`,
              last_name: 'Test',
              completeness_score: 30
            }
          });
        }

        // Call the service
        const result = await getNetworkCompleteness({
          db,
          userId: testUser.id
        });

        // Verify results
        expect(result.error).toBeNull();
        expect(result.data).not.toBeNull();

        if (result.data) {
          // All group scores should be 0 since groups are empty
          expect(result.data.inner5).toBe(0);
          expect(result.data.central50).toBe(0);
          expect(result.data.strategic100).toBe(0);

          // Everyone should be 30 (average of 30, 30, 30)
          expect(result.data.everyone).toBe(30);
        }
      });
    });

    it('should handle 0 completeness scores correctly', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user
        testUser = await createTestUser({ db });

        // Create the inner 5 group
        const inner5Group = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Inner 5',
            slug: 'inner-5'
          }
        });

        // Create people with mixed null and non-null completeness scores
        const people = [];

        // Two people with scores
        for (let i = 0; i < 2; i++) {
          const person = await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: `Person${i}`,
              last_name: 'WithScore',
              completeness_score: 50
            }
          });
          people.push(person);

          // Add to Inner 5 group
          await createTestGroupMember({
            db,
            data: {
              group_id: inner5Group.id,
              person_id: person.id,
              user_id: testUser.id
            }
          });
        }

        // Two people with null scores
        for (let i = 0; i < 2; i++) {
          const person = await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: `Person${i}`,
              last_name: 'NoScore'
            }
          });
          people.push(person);

          // Add to Inner 5 group
          await createTestGroupMember({
            db,
            data: {
              group_id: inner5Group.id,
              person_id: person.id,
              user_id: testUser.id
            }
          });
        }

        // Create people for Everyone Else with completeness scores of 10
        for (let i = 0; i < 3; i++) {
          await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: `Everyone${i}`,
              last_name: 'Person',
              completeness_score: 10
            }
          });
        }

        // Call the service
        const result = await getNetworkCompleteness({
          db,
          userId: testUser.id
        });

        // Verify results
        expect(result.error).toBeNull();
        expect(result.data).not.toBeNull();

        if (result.data) {
          // Inner 5 should be 25 (average of 50, 50, 0, 0)
          expect(result.data.inner5).toBe(25);

          // Everyone should be 10 since it only includes people not in core groups
          expect(result.data.everyone).toBe(10);
        }
      });
    });

    it('should handle people in multiple core groups correctly', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user
        testUser = await createTestUser({ db });

        // Create the reserved groups
        const inner5Group = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Inner 5',
            slug: 'inner-5'
          }
        });

        const central50Group = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Central 50',
            slug: 'central-50'
          }
        });

        // Create a person that will be in both groups
        const sharedPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'Shared',
            last_name: 'Person',
            completeness_score: 75
          }
        });

        // Add to Inner 5 group
        await createTestGroupMember({
          db,
          data: {
            group_id: inner5Group.id,
            person_id: sharedPerson.id,
            user_id: testUser.id
          }
        });

        // Add to Central 50 group
        await createTestGroupMember({
          db,
          data: {
            group_id: central50Group.id,
            person_id: sharedPerson.id,
            user_id: testUser.id
          }
        });

        // Create a person for Everyone Else
        await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'Everyone',
            last_name: 'Person',
            completeness_score: 25
          }
        });

        // Call the service
        const result = await getNetworkCompleteness({
          db,
          userId: testUser.id
        });

        // Verify results
        expect(result.error).toBeNull();
        expect(result.data).not.toBeNull();

        if (result.data) {
          // Inner 5 should be 75
          expect(result.data.inner5).toBe(75);

          // Central 50 should be 75
          expect(result.data.central50).toBe(75);

          // Everyone should be 25 (only the one person not in core groups)
          expect(result.data.everyone).toBe(25);
        }
      });
    });
  });

  describe('error cases', () => {
    it('should return error for missing user ID', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await getNetworkCompleteness({
          db,
          userId: ''
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.INVALID_USER);
      });
    });
  });
});
