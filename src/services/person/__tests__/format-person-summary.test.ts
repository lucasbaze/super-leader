import { SupabaseClient } from '@supabase/supabase-js';

import { createTestGroup } from '@/tests/test-builder/create-group';
import { createTestGroupMember } from '@/tests/test-builder/create-group-member';
import { createTestInteraction } from '@/tests/test-builder/create-interaction';
import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { ERRORS, formatPersonSummary } from '../format-person-summary';

// Helper types for test setup
interface TestSetupOptions {
  includeContactMethods?: boolean;
  includeAddresses?: boolean;
  includeWebsites?: boolean;
  includeGroups?: boolean;
  includeInteractions?: boolean;
  includeAISummary?: boolean;
  includeDateMet?: boolean;
}

interface TestSetupResult {
  testUser: any;
  testPerson: any;
  groups: any[];
}

describe('format-person-summary service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  // Helper function to set up test data with configurable options
  async function setupTestData(db: any, options: TestSetupOptions = {}): Promise<TestSetupResult> {
    const {
      includeContactMethods = true,
      includeAddresses = true,
      includeWebsites = true,
      includeGroups = true,
      includeInteractions = true,
      includeAISummary = true,
      includeDateMet = true
    } = options;

    // Setup test user
    const testUser = await createTestUser({ db });

    // Create base person data
    const personData: any = {
      user_id: testUser.id,
      first_name: 'Darian',
      last_name: 'Bajmanlou',
      bio: 'Software engineer and Bitcoin enthusiast',
      birthday: '1995-04-01'
    };

    // Add optional fields based on options
    if (includeContactMethods) {
      personData.contactMethods = [
        { type: 'email', value: 'darian@example.com' },
        { type: 'phone', value: '+1234567890' },
        { type: 'linkedin', value: 'linkedin.com/in/darian' }
      ];
    }

    if (includeAddresses) {
      personData.addresses = [
        {
          type: 'home',
          street: '123 Main St',
          city: 'Austin',
          state: 'TX',
          country: 'USA'
        },
        {
          type: 'work',
          street: '456 Tech Blvd',
          city: 'Austin',
          state: 'TX',
          country: 'USA'
        }
      ];
    }

    if (includeWebsites) {
      personData.websites = [
        { url: 'https://darian.com', type: 'personal' },
        { url: 'https://github.com/darian', type: 'github' }
      ];
    }

    // Create the person
    const testPerson = await createTestPerson({
      db,
      data: personData
    });

    // Add additional fields directly to the database
    const updateData: any = {};

    if (includeDateMet) {
      updateData.date_met = '2020-01-15';
    }

    if (includeAISummary) {
      updateData.ai_summary = {
        completeness: 45,
        groupedSections: [
          {
            sections: [
              {
                icon: '👤',
                title: 'Background',
                content:
                  'Darian Bajmanlou was born on April 1, 1995. He is part of the Inner 5 group and is involved in Bitcoin and Dinner groups.'
              },
              {
                icon: '👨‍👩‍👧‍👦',
                title: 'Family',
                content:
                  "Darian's father's name is Matt, who works as a middle manager at Schlumberger. Darian has a sister who is noted to be very tall."
              },
              {
                icon: '⭐',
                title: 'Personal Interests',
                content:
                  'Darian has recently attended a bachelor party in Vegas and went to Puerto Rico for five days. He is also planning to go hunting for an urban sniper training course in May.'
              }
            ]
          },
          {
            sections: [
              {
                icon: '🤝',
                title: 'Interaction History',
                content:
                  "Recent interactions include being invited to Darian's father's party for the Persian New Year and planning to go hunting together. There have been multiple notes about family and personal activities."
              }
            ]
          }
        ],
        followUpQuestions: [
          "What are Darian's professional goals or aspirations?",
          'What specific role does Darian play in the Bitcoin group?',
          'How does Darian typically communicate or prefer to be contacted?',
          "What are Darian's current professional challenges or needs?",
          "Who are some key people in Darian's network that you might know?"
        ],
        insightRecommendations: [
          {
            icon: '🌍',
            title: 'Explore Persian Culture',
            insightRecommendation:
              "Since Darian invited you to his father's party for the Persian New Year, consider learning more about Persian culture and traditions. This could be a great conversation starter and show genuine interest in his background."
          },
          {
            icon: '🎉',
            title: 'Plan a Birthday Surprise',
            insightRecommendation:
              "Darian's birthday is on April 1st. Planning a small surprise or a thoughtful gesture could strengthen your relationship, especially since you are in his Inner 5 group."
          },
          {
            icon: '✈️',
            title: 'Discuss Travel Experiences',
            insightRecommendation:
              'Darian seems to enjoy traveling, as seen with his trips to Vegas and Puerto Rico. Discussing travel experiences or planning a future trip together could be a great way to bond.'
          }
        ]
      };
    }

    // Only update if there's data to update
    if (Object.keys(updateData).length > 0) {
      await db.from('person').update(updateData).eq('id', testPerson.id);
    }

    const groups: any[] = [];

    // Create groups if needed
    if (includeGroups) {
      const inner5Group = await createTestGroup({
        db,
        data: {
          user_id: testUser.id,
          name: 'Inner 5',
          slug: 'inner-5',
          icon: '👥'
        }
      });

      const bitcoinGroup = await createTestGroup({
        db,
        data: {
          user_id: testUser.id,
          name: 'Bitcoin',
          slug: 'bitcoin',
          icon: '₿'
        }
      });

      const dinnerGroup = await createTestGroup({
        db,
        data: {
          user_id: testUser.id,
          name: 'Dinner',
          slug: 'dinner',
          icon: '🍽️'
        }
      });

      groups.push(inner5Group, bitcoinGroup, dinnerGroup);

      // Add person to groups
      await createTestGroupMember({
        db,
        data: {
          group_id: inner5Group.id,
          person_id: testPerson.id,
          user_id: testUser.id
        }
      });

      await createTestGroupMember({
        db,
        data: {
          group_id: bitcoinGroup.id,
          person_id: testPerson.id,
          user_id: testUser.id
        }
      });

      await createTestGroupMember({
        db,
        data: {
          group_id: dinnerGroup.id,
          person_id: testPerson.id,
          user_id: testUser.id
        }
      });
    }

    // Create interactions if needed
    if (includeInteractions) {
      await createTestInteraction({
        db,
        data: {
          person_id: testPerson.id,
          user_id: testUser.id,
          type: 'meeting',
          note: 'Had coffee and discussed Bitcoin',
          created_at: new Date('2023-01-15')
        }
      });

      await createTestInteraction({
        db,
        data: {
          person_id: testPerson.id,
          user_id: testUser.id,
          type: 'call',
          note: 'Discussed upcoming hunting trip',
          created_at: new Date('2023-02-20')
        }
      });

      await createTestInteraction({
        db,
        data: {
          person_id: testPerson.id,
          user_id: testUser.id,
          type: 'event',
          note: "Attended Persian New Year party at his father's house",
          created_at: new Date('2023-03-15')
        }
      });
    }

    return { testUser, testPerson, groups };
  }

  // Helper function to verify the summary contains expected content
  function verifySummaryContent(summary: string, options: TestSetupOptions = {}) {
    const {
      includeContactMethods = true,
      includeAddresses = true,
      includeWebsites = true,
      includeGroups = true,
      includeInteractions = true
    } = options;

    // Always check for basic info
    expect(summary).toContain('test_Darian test_Bajmanlou');

    // Check for optional content based on options
    if (includeGroups) {
      expect(summary).toContain('Inner 5');
      expect(summary).toContain('Bitcoin');
      expect(summary).toContain('Dinner');
    } else {
      expect(summary).toContain('No groups saved');
    }

    if (includeContactMethods) {
      expect(summary).toContain('darian@example.com');
      expect(summary).toContain('+1234567890');
    } else {
      expect(summary).toContain('No contact methods saved');
    }

    if (includeAddresses) {
      expect(summary).toContain('123 Main St');
      expect(summary).toContain('456 Tech Blvd');
    } else {
      expect(summary).toContain('No addresses saved');
    }

    if (includeWebsites) {
      expect(summary).toContain('https://darian.com');
      expect(summary).toContain('https://github.com/darian');
    } else {
      expect(summary).toContain('No websites saved');
    }

    if (includeInteractions) {
      expect(summary).toContain('Persian New Year party');
      expect(summary).toContain('hunting trip');
    } else {
      expect(summary).toContain('No interactions saved');
    }
  }

  describe('success cases', () => {
    it('should format a complete person summary with all information', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Setup test data with all options enabled
        const { testPerson } = await setupTestData(db, {
          includeContactMethods: true,
          includeAddresses: true,
          includeWebsites: true,
          includeGroups: true,
          includeInteractions: true,
          includeAISummary: true,
          includeDateMet: true
        });

        // Call the formatPersonSummary function
        const result = await formatPersonSummary({
          db,
          personId: testPerson.id
        });

        // Verify the result
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();

        // Log the formatted summary to see the output
        console.log('Formatted Person Summary (Complete):');
        console.log(result.data);

        // Verify the summary contains expected sections
        if (result.data) {
          verifySummaryContent(result.data, {
            includeContactMethods: true,
            includeAddresses: true,
            includeWebsites: true,
            includeGroups: true,
            includeInteractions: true
          });
        }
      });
    });

    it('should format a person summary without groups', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Setup test data without groups
        const { testPerson } = await setupTestData(db, {
          includeContactMethods: true,
          includeAddresses: true,
          includeWebsites: true,
          includeGroups: false,
          includeInteractions: true,
          includeAISummary: true,
          includeDateMet: true
        });

        // Call the formatPersonSummary function
        const result = await formatPersonSummary({
          db,
          personId: testPerson.id
        });

        // Verify the result
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();

        // Log the formatted summary to see the output
        console.log('Formatted Person Summary (No Groups):');
        console.log(result.data);

        // Verify the summary contains expected sections
        if (result.data) {
          verifySummaryContent(result.data, {
            includeContactMethods: true,
            includeAddresses: true,
            includeWebsites: true,
            includeGroups: false,
            includeInteractions: true
          });
        }
      });
    });

    it('should format a person summary without contact methods', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Setup test data without contact methods
        const { testPerson } = await setupTestData(db, {
          includeContactMethods: false,
          includeAddresses: true,
          includeWebsites: true,
          includeGroups: true,
          includeInteractions: true,
          includeAISummary: true,
          includeDateMet: true
        });

        // Call the formatPersonSummary function
        const result = await formatPersonSummary({
          db,
          personId: testPerson.id
        });

        // Verify the result
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();

        // Log the formatted summary to see the output
        console.log('Formatted Person Summary (No Contact Methods):');
        console.log(result.data);

        // Verify the summary contains expected sections
        if (result.data) {
          verifySummaryContent(result.data, {
            includeContactMethods: false,
            includeAddresses: true,
            includeWebsites: true,
            includeGroups: true,
            includeInteractions: true
          });
        }
      });
    });

    it('should format a person summary without websites', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Setup test data without websites
        const { testPerson } = await setupTestData(db, {
          includeContactMethods: true,
          includeAddresses: true,
          includeWebsites: false,
          includeGroups: true,
          includeInteractions: true,
          includeAISummary: true,
          includeDateMet: true
        });

        // Call the formatPersonSummary function
        const result = await formatPersonSummary({
          db,
          personId: testPerson.id
        });

        // Verify the result
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();

        // Log the formatted summary to see the output
        console.log('Formatted Person Summary (No Websites):');
        console.log(result.data);

        // Verify the summary contains expected sections
        if (result.data) {
          verifySummaryContent(result.data, {
            includeContactMethods: true,
            includeAddresses: true,
            includeWebsites: false,
            includeGroups: true,
            includeInteractions: true
          });
        }
      });
    });

    it('should format a person summary without AI summary', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Setup test data without AI summary
        const { testPerson } = await setupTestData(db, {
          includeContactMethods: true,
          includeAddresses: true,
          includeWebsites: true,
          includeGroups: true,
          includeInteractions: true,
          includeAISummary: false,
          includeDateMet: true
        });

        // Call the formatPersonSummary function
        const result = await formatPersonSummary({
          db,
          personId: testPerson.id
        });

        // Verify the result
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();

        // Log the formatted summary to see the output
        console.log('Formatted Person Summary (No AI Summary):');
        console.log(result.data);

        // Verify the summary contains expected sections
        if (result.data) {
          verifySummaryContent(result.data, {
            includeContactMethods: true,
            includeAddresses: true,
            includeWebsites: true,
            includeGroups: true,
            includeInteractions: true
          });
        }
      });
    });

    it('should format a person summary with minimal information', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Setup test data with minimal information
        const { testPerson } = await setupTestData(db, {
          includeContactMethods: false,
          includeAddresses: false,
          includeWebsites: false,
          includeGroups: false,
          includeInteractions: false,
          includeAISummary: false,
          includeDateMet: false
        });

        // Call the formatPersonSummary function
        const result = await formatPersonSummary({
          db,
          personId: testPerson.id
        });

        // Verify the result
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();

        // Log the formatted summary to see the output
        console.log('Formatted Person Summary (Minimal):');
        console.log(result.data);

        // Verify the summary contains expected sections
        if (result.data) {
          verifySummaryContent(result.data, {
            includeContactMethods: false,
            includeAddresses: false,
            includeWebsites: false,
            includeGroups: false,
            includeInteractions: false
          });
        }
      });
    });
  });

  describe('error cases', () => {
    it('should return error for non-existent person', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await formatPersonSummary({
          db,
          personId: 'non-existent-id'
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.FORMAT.PERSON_NOT_FOUND);
      });
    });
  });
});
