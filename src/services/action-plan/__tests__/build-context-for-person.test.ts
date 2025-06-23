import { SupabaseClient } from '@supabase/supabase-js';

import {
  createTestGroup,
  createTestGroupMember,
  createTestInteraction,
  createTestOrganization,
  createTestPerson,
  createTestTaskSuggestion,
  createTestUser
} from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { buildContextForPerson, ERRORS } from '../build-context-for-person';

describe('buildContextForPerson service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should build context for a new person with minimal information', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe'
          },
          withPrefix: false
        });

        const result = await buildContextForPerson({
          db,
          userId: testUser.id,
          personId: testPerson.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        expect(typeof result.data).toBe('string');

        const profile = result.data!;

        // Should contain basic information
        expect(profile).toContain('# John Doe');
        expect(profile).toContain('## Contact Information');
        expect(profile).toContain('No contact methods available');
        expect(profile).toContain('## Addresses');
        expect(profile).toContain('No addresses available');
        expect(profile).toContain('## Groups');
        expect(profile).toContain('No groups assigned');
        expect(profile).toContain('## Organizations');
        expect(profile).toContain('No organizations associated');
        expect(profile).toContain('## Person Relationships');
        expect(profile).toContain('No person relationships');
        expect(profile).toContain('## Recent Interactions');
        expect(profile).toContain('No recent interactions');
        expect(profile).toContain('## Active Tasks');
        expect(profile).toContain('No active tasks');

        // Should not contain AI summary section for new person
        expect(profile).not.toContain('## AI Summary');
      });
    });

    it('should build context for a person with moderate information', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        // Create test person with some basic info
        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'Jane',
            last_name: 'Smith',
            title: 'Software Engineer',
            bio: 'Passionate about building great software',
            birthday: '1990-05-15',
            date_met: '2023-01-15',
            completeness_score: 75,
            follow_up_score: 0.5,
            contactMethods: [
              { type: 'email', value: 'jane@example.com', is_primary: true },
              { type: 'phone', value: '+1234567890' }
            ],
            addresses: [
              {
                type: 'home',
                street: '123 Main St',
                city: 'San Francisco',
                state: 'CA',
                country: 'USA',
                is_primary: true
              }
            ],
            websites: [{ url: 'https://janesmith.dev', type: 'personal' }]
          },
          withPrefix: false
        });

        // Create a test group and add person to it
        const testGroup = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Tech Team',
            slug: 'tech-team',
            icon: '💻'
          }
        });

        await createTestGroupMember({
          db,
          data: {
            user_id: testUser.id,
            person_id: testPerson.id,
            group_id: testGroup.id
          }
        });

        // Create a test organization and link person to it
        const testOrg = await createTestOrganization({
          db,
          data: {
            user_id: testUser.id,
            name: 'Tech Corp',
            url: 'https://techcorp.com'
          }
        });

        await db.from('person_organization').insert({
          person_id: testPerson.id,
          organization_id: testOrg.id,
          user_id: testUser.id
        });

        // Create some recent interactions
        await createTestInteraction({
          db,
          data: {
            person_id: testPerson.id,
            user_id: testUser.id,
            type: 'coffee',
            note: 'Had coffee and discussed new project ideas'
          }
        });

        await createTestInteraction({
          db,
          data: {
            person_id: testPerson.id,
            user_id: testUser.id,
            type: 'email',
            note: 'Followed up on collaboration proposal'
          }
        });

        const result = await buildContextForPerson({
          db,
          userId: testUser.id,
          personId: testPerson.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();

        const profile = result.data!;

        // Should contain enhanced information
        expect(profile).toContain('# Jane Smith');
        expect(profile).toContain('**Title:** Software Engineer');
        expect(profile).toContain('**Bio:** Passionate about building great software');
        // expect(profile).toContain('**Birthday:** 5/15/1990');
        // expect(profile).toContain('**Date Met:** 1/15/2023');
        expect(profile).toContain('**Profile Completeness:** 75%');
        expect(profile).toContain('**Follow-up Score:** 0.5');

        // Contact information
        expect(profile).toContain('Primary: email - jane@example.com');
        expect(profile).toContain('• phone - +1234567890');

        // Address
        expect(profile).toContain('Primary Address:');
        expect(profile).toContain('123 Main St');
        expect(profile).toContain('San Francisco, CA');

        // Website
        expect(profile).toContain('• https://janesmith.dev (personal)');

        // Group
        expect(profile).toContain('• Tech Team');

        // Organization
        expect(profile).toContain('• Tech Corp');

        // Interactions
        expect(profile).toContain('coffee - Had coffee and discussed new project ideas');
        expect(profile).toContain('email - Followed up on collaboration proposal');
      });
    });

    it('should build context for a person with comprehensive information including AI summary', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        // Create test person with comprehensive info
        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'Michael',
            last_name: 'Johnson',
            title: 'Senior Product Manager',
            bio: 'Experienced product leader with 10+ years in tech',
            birthday: '1985-08-22',
            date_met: '2022-06-10',
            completeness_score: 95,
            follow_up_score: 0.9,
            contactMethods: [
              { type: 'email', value: 'michael@company.com', is_primary: true },
              { type: 'phone', value: '+1987654321' },
              { type: 'linkedin', value: 'linkedin.com/in/michaeljohnson' }
            ],
            addresses: [
              {
                type: 'home',
                street: '456 Oak Avenue',
                city: 'New York',
                state: 'NY',
                country: 'USA',
                is_primary: true
              },
              {
                type: 'work',
                street: '789 Business Blvd',
                city: 'New York',
                state: 'NY',
                country: 'USA'
              }
            ],
            websites: [
              { url: 'https://michaeljohnson.com', type: 'personal' },
              { url: 'https://company.com/team/michael', type: 'work' }
            ]
          },
          withPrefix: false
        });

        // Update person with AI summary
        const mockAiSummary = {
          groupedSections: [
            {
              sections: [
                {
                  title: 'Professional Background',
                  content: 'Michael is a senior product manager with extensive experience in SaaS products.'
                },
                {
                  title: 'Interests',
                  content: 'Passionate about user experience and data-driven decision making.'
                }
              ]
            }
          ],
          insightRecommendations: [
            {
              title: 'Follow-up Strategy',
              insightRecommendation: 'Consider discussing recent product launches and industry trends.'
            }
          ],
          followUpQuestions: [
            'What challenges are you facing in your current role?',
            'How do you stay updated with industry trends?'
          ]
        };

        await db.from('person').update({ ai_summary: mockAiSummary }).eq('id', testPerson.id);

        // Create multiple groups
        const group1 = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Product Team',
            slug: 'product-team',
            icon: '📊'
          }
        });

        const group2 = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Leadership',
            slug: 'leadership',
            icon: '👥'
          }
        });

        await createTestGroupMember({
          db,
          data: {
            user_id: testUser.id,
            person_id: testPerson.id,
            group_id: group1.id
          }
        });

        await createTestGroupMember({
          db,
          data: {
            user_id: testUser.id,
            person_id: testPerson.id,
            group_id: group2.id
          }
        });

        // Create multiple organizations
        const org1 = await createTestOrganization({
          db,
          data: {
            user_id: testUser.id,
            name: 'Tech Solutions Inc',
            url: 'https://techsolutions.com'
          }
        });

        const org2 = await createTestOrganization({
          db,
          data: {
            user_id: testUser.id,
            name: 'Product Leaders Network',
            url: 'https://productleaders.org'
          }
        });

        await db.from('person_organization').insert([
          {
            person_id: testPerson.id,
            organization_id: org1.id,
            user_id: testUser.id
          },
          {
            person_id: testPerson.id,
            organization_id: org2.id,
            user_id: testUser.id
          }
        ]);

        // Create multiple interactions
        await createTestInteraction({
          db,
          data: {
            person_id: testPerson.id,
            user_id: testUser.id,
            type: 'meeting',
            note: 'Quarterly planning session - discussed Q4 roadmap'
          }
        });

        await createTestInteraction({
          db,
          data: {
            person_id: testPerson.id,
            user_id: testUser.id,
            type: 'conference',
            note: 'Met at ProductCon 2024 - shared insights on user research'
          }
        });

        await createTestInteraction({
          db,
          data: {
            person_id: testPerson.id,
            user_id: testUser.id,
            type: 'lunch',
            note: 'Casual lunch - discussed career growth and mentorship'
          }
        });

        // Create active tasks
        await createTestTaskSuggestion(db, {
          userId: testUser.id,
          personId: testPerson.id,
          context: { context: 'Follow up on product collaboration', callToAction: 'Schedule meeting' },
          endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        });

        await createTestTaskSuggestion(db, {
          userId: testUser.id,
          personId: testPerson.id,
          context: { context: 'Share industry article', callToAction: 'Send email with article link' },
          endAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
        });

        const result = await buildContextForPerson({
          db,
          userId: testUser.id,
          personId: testPerson.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();

        const profile = result.data!;

        // Should contain comprehensive information
        expect(profile).toContain('# Michael Johnson');
        expect(profile).toContain('**Title:** Senior Product Manager');
        expect(profile).toContain('**Bio:** Experienced product leader with 10+ years in tech');
        // expect(profile).toContain('**Birthday:** 8/22/1985');
        // expect(profile).toContain('**Date Met:** 6/10/2022');
        expect(profile).toContain('**Profile Completeness:** 95%');
        expect(profile).toContain('**Follow-up Score:** 0.9');

        // Contact information
        expect(profile).toContain('Primary: email - michael@company.com');
        expect(profile).toContain('• phone - +1987654321');
        expect(profile).toContain('• linkedin - linkedin.com/in/michaeljohnson');

        // Addresses
        expect(profile).toContain('Primary Address:');
        expect(profile).toContain('456 Oak Avenue');
        expect(profile).toContain('New York, NY');
        expect(profile).toContain('Other addresses:');
        expect(profile).toContain('• 789 Business Blvd, New York, NY');

        // Websites
        expect(profile).toContain('• https://michaeljohnson.com (personal)');
        expect(profile).toContain('• https://company.com/team/michael (work)');

        // Groups
        expect(profile).toContain('• Product Team');
        expect(profile).toContain('• Leadership');

        // Organizations
        expect(profile).toContain('• Tech Solutions Inc');
        expect(profile).toContain('• Product Leaders Network');

        // Interactions (should show last 3)
        expect(profile).toContain('meeting - Quarterly planning session - discussed Q4 roadmap');
        expect(profile).toContain('conference - Met at ProductCon 2024 - shared insights on user research');
        expect(profile).toContain('lunch - Casual lunch - discussed career growth and mentorship');

        // Tasks (should show up to 5)
        expect(profile).toContain('Follow up on product collaboration');
        expect(profile).toContain('Share industry article');

        // AI Summary
        expect(profile).toContain('## AI Summary');
        expect(profile).toContain('Section 1');
        expect(profile).toContain(
          'Professional Background: Michael is a senior product manager with extensive experience in SaaS products.'
        );
        expect(profile).toContain('Interests: Passionate about user experience and data-driven decision making.');
        expect(profile).toContain('Insight Recommendations');
        expect(profile).toContain(
          'Follow-up Strategy: Consider discussing recent product launches and industry trends.'
        );
        expect(profile).toContain('Follow-Up Questions');
        expect(profile).toContain('1. What challenges are you facing in your current role?');
        expect(profile).toContain('2. How do you stay updated with industry trends?');
      });
    });
  });

  describe('error cases', () => {
    it('should return error for missing user ID', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

        const result = await buildContextForPerson({
          db,
          userId: '',
          personId: testPerson.id
        });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(ERRORS.CONTEXT.MISSING_USER_ID);
      });
    });

    it('should return error for missing person ID', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const result = await buildContextForPerson({
          db,
          userId: testUser.id,
          personId: ''
        });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(ERRORS.CONTEXT.MISSING_PERSON_ID);
      });
    });

    it('should return error for non-existent person', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const result = await buildContextForPerson({
          db,
          userId: testUser.id,
          personId: '00000000-0000-0000-0000-000000000000'
        });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(ERRORS.CONTEXT.PERSON_NOT_FOUND);
      });
    });
  });
});
