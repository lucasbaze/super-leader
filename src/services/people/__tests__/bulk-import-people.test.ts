import { faker } from '@faker-js/faker';
import { SupabaseClient } from '@supabase/supabase-js';

import { createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { bulkImportPeople, TBulkImportPerson } from '../bulk-import-people';

describe('bulkImportPeople service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should import multiple people with all related data', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const importData: TBulkImportPerson[] = [
          {
            first_name: 'John',
            last_name: 'Doe',
            bio: 'Test bio',
            addresses: [
              {
                label: 'Home',
                street: '123 Test St',
                city: 'Test City',
                state: 'TS',
                postal_code: '12345',
                country: 'Test Country',
                is_primary: true
              }
            ],
            contact_methods: [
              {
                type: 'email',
                value: 'john@test.com',
                is_primary: true,
                label: 'Home',
                platform_icon: 'email'
              },
              {
                type: 'phone',
                value: '123-456-7890',
                is_primary: true,
                label: 'Home',
                platform_icon: 'phone'
              }
            ],
            websites: [
              {
                url: 'https://test.com',
                label: 'Personal Website',
                icon: '🌐'
              }
            ],
            groups: [
              {
                name: 'Test Group',
                slug: 'test-group',
                icon: '🤹'
              }
            ],
            interactions: [
              {
                note: 'Initial meeting note',
                type: 'meeting'
              },
              {
                note: 'Follow-up required',
                type: 'note'
              },
              {
                note: 'Talked about his bowel movements',
                type: 'phone'
              }
            ]
          }
        ];

        const result = await bulkImportPeople({
          db,
          userId: testUser.id,
          people: importData
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          successful: 1,
          failed: 0,
          errors: []
        });

        // Verify the imported data
        const { data: people } = await db
          .from('person')
          .select('*, addresses(*), contact_methods(*), websites(*), interactions(*)')
          .eq('user_id', testUser.id);

        expect(people).toHaveLength(1);
        expect(people![0]).toMatchObject({
          first_name: 'John',
          last_name: 'Doe',
          bio: 'Test bio'
        });
        expect(people![0].addresses).toHaveLength(1);
        expect(people![0].contact_methods).toHaveLength(2);
        expect(people![0].websites).toHaveLength(1);
        expect(people![0].interactions).toHaveLength(3);
      });
    });

    it('should handle bulk import of 50 people with varying data completeness', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        // Generate 50 test people with varying completeness
        const importData: TBulkImportPerson[] = Array.from({ length: 50 }).map((_, i) => {
          const hasAddresses = Math.random() > 0.3;
          const hasContacts = Math.random() > 0.2;
          const hasWebsites = Math.random() > 0.6;
          const hasGroups = Math.random() > 0.7;
          const interactionCount = Math.floor(Math.random() * 6); // 0-5 interactions

          return {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            bio: Math.random() > 0.5 ? faker.company.catchPhrase() : undefined,
            birthday: Math.random() > 0.7 ? faker.date.past().toISOString() : undefined,

            addresses: hasAddresses
              ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => ({
                  street: faker.location.streetAddress(),
                  city: faker.location.city(),
                  state: faker.location.state(),
                  postal_code: faker.location.zipCode(),
                  country: faker.location.country(),
                  label: faker.helpers.arrayElement(['Home', 'Work', 'Other']),
                  is_primary: true
                }))
              : undefined,

            contact_methods: hasContacts
              ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => ({
                  type: faker.helpers.arrayElement(['email', 'phone', 'telegram', 'whatsapp']),
                  value: faker.internet.email(),
                  label: faker.helpers.arrayElement(['Personal', 'Work', 'Other']),
                  is_primary: true,
                  platform_icon: 'default'
                }))
              : undefined,

            websites: hasWebsites
              ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => ({
                  url: faker.internet.url(),
                  label: faker.company.name(),
                  icon: 'website'
                }))
              : undefined,

            groups: hasGroups
              ? (() => {
                  const groupNames = ['Friends', 'Work', 'Family', 'School'];
                  const numGroups = Math.floor(Math.random() * 2) + 1;
                  // Shuffle array and take first n elements to ensure uniqueness
                  return faker.helpers
                    .shuffle(groupNames)
                    .slice(0, numGroups)
                    .map((name) => ({
                      name,
                      slug: faker.helpers.slugify(name),
                      icon: 'random'
                    }));
                })()
              : undefined,

            interactions:
              interactionCount > 0
                ? Array.from({ length: interactionCount }).map(() => ({
                    note: faker.helpers.arrayElement([
                      'Met at conference, discussed AI ethics',
                      'Quarterly review meeting - exceeded targets',
                      'Coffee chat about career growth',
                      'Introduced by mutual connection',
                      'Project collaboration discussion'
                    ]),
                    type: faker.helpers.arrayElement(['meeting', 'call', 'note'])
                  }))
                : undefined
          };
        });

        const result = await bulkImportPeople({
          db,
          userId: testUser.id,
          people: importData
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          successful: 50,
          failed: 0,
          errors: []
        });

        // Verify the imported data
        const { count: personCount } = await db
          .from('person')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', testUser.id);

        expect(personCount).toBe(50);

        // Check for related data
        const { data: samplePerson } = await db
          .from('person')
          .select(
            `
            *,
            addresses(*),
            contact_methods(*),
            websites(*),
            group_member(group(*)),
            interactions(*)
          `
          )
          .eq('user_id', testUser.id)
          .limit(1)
          .single();

        expect(samplePerson).toBeDefined();
        if (samplePerson.addresses) expect(Array.isArray(samplePerson.addresses)).toBe(true);
        if (samplePerson.contact_methods)
          expect(Array.isArray(samplePerson.contact_methods)).toBe(true);
        if (samplePerson.websites) expect(Array.isArray(samplePerson.websites)).toBe(true);
        if (samplePerson.group_member) expect(Array.isArray(samplePerson.group_member)).toBe(true);
        if (samplePerson.interactions) expect(Array.isArray(samplePerson.interactions)).toBe(true);
      });
    });
  });

  describe('error cases', () => {
    it('should handle invalid person data', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const importData: TBulkImportPerson[] = [
          {
            first_name: 'John',
            last_name: 'Doe',
            websites: [
              // @ts-expect-error - missing url param
              {
                label: 'Invalid Website',
                icon: 'twitter'
              }
            ]
          }
        ];

        const result = await bulkImportPeople({
          db,
          userId: testUser.id,
          people: importData
        });

        expect(result.data).toMatchObject({
          successful: 0,
          failed: 1,
          errors: expect.arrayContaining([
            expect.objectContaining({
              type: 'person',
              error: 'Validation failed'
            })
          ]),
          partialFailures: []
        });

        // Verify person was still created
        const { count } = await db
          .from('person')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', testUser.id);

        expect(count).toBe(0);
      });
    });
  });

  describe('validation cases', () => {
    it('should reject invalid person data but continue with valid ones', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const importData = [
          {
            first_name: 'John',
            last_name: 'Doe'
          },
          {
            // Invalid: missing required first_name
            last_name: 'Smith',
            // Invalid property
            invalid_field: 'should not be here'
          },
          {
            first_name: 'Jane',
            last_name: 'Doe',
            // Invalid website data
            websites: [
              {
                url: 'not-a-valid-url',
                invalid_prop: 'test'
              }
            ]
          }
        ];

        const result = await bulkImportPeople({
          db,
          userId: testUser.id,
          // @ts-expect-error - testing invalid data
          people: importData
        });

        expect(result.data).toMatchObject({
          successful: 1,
          failed: 2,
          errors: expect.arrayContaining([
            expect.objectContaining({
              index: 1,
              type: 'person'
            }),
            expect.objectContaining({
              index: 2,
              type: 'person'
            })
          ])
        });

        // Verify only the valid record was imported
        const { count } = await db
          .from('person')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', testUser.id);

        expect(count).toBe(1);
      });
    });
  });
});
