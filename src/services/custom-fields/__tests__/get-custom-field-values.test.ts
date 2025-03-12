import { getCustomFieldValues } from '@/services/custom-fields/get-custom-field-values';
import { createTestGroup, createTestPerson, createTestUser } from '@/tests/test-builder';
import { cleanupAllTestUsers } from '@/tests/utils/cleanup-utils';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { AuthUser, DBClient } from '@/types/database';
import { createClient } from '@/utils/supabase/server';

import { createCustomField, createCustomFieldValue } from '../';

describe('getCustomFieldValues service', () => {
  let supabase: DBClient;
  let testUser: AuthUser;

  beforeAll(async () => {
    supabase = await createClient();
  });

  afterAll(async () => {
    await cleanupAllTestUsers(supabase);
  });

  describe('success cases', () => {
    it('should return all general person fields even if no values exist', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user and person
        testUser = await createTestUser({ db });
        const person = await createTestPerson({
          db,
          data: { user_id: testUser.id, first_name: 'Test', last_name: 'Person' }
        });

        // Create a general person field
        const { data: field } = await createCustomField({
          db,
          userId: testUser.id,
          name: 'Test Field',
          fieldType: 'text',
          entityType: 'person'
        });

        if (!field) throw new Error('Failed to create field');

        const result = await getCustomFieldValues({
          db,
          userId: testUser.id,
          entityId: person.id,
          entityType: 'person'
        });

        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        expect(result.data?.fields).toHaveLength(1);
        expect(result.data?.values).toHaveLength(0);
        expect(result.data?.fields[0].name).toBe('Test Field');
      });
    });

    it('should return both general and group-specific fields for a person in groups', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user, person, and group
        testUser = await createTestUser({ db });
        const person = await createTestPerson({
          db,
          data: { user_id: testUser.id, first_name: 'John', last_name: 'Doe' }
        });
        const group = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Test Group',
            slug: 'test-group'
          }
        });

        // Add person to group
        await db.from('group_member').insert({
          group_id: group.id,
          person_id: person.id,
          user_id: testUser.id
        });

        // Create a general person field
        const { data: generalField } = await createCustomField({
          db,
          userId: testUser.id,
          name: 'General Field',
          fieldType: 'text',
          entityType: 'person'
        });

        // Create a group-specific field
        const { data: groupField } = await createCustomField({
          db,
          userId: testUser.id,
          name: 'Group Field',
          fieldType: 'text',
          entityType: 'person',
          groupId: group.id
        });

        if (!generalField || !groupField) throw new Error('Failed to create fields');

        // Create a value for the general field
        await createCustomFieldValue({
          db,
          userId: testUser.id,
          customFieldId: generalField.id,
          entityId: person.id,
          value: 'General Value'
        });

        const result = await getCustomFieldValues({
          db,
          userId: testUser.id,
          entityId: person.id,
          entityType: 'person'
        });

        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        expect(result.data?.fields).toHaveLength(2);
        expect(result.data?.values).toHaveLength(1);
        expect(result.data?.fields.map((f) => f.name)).toContain('General Field');
        expect(result.data?.fields.map((f) => f.name)).toContain('Group Field');
        expect(result.data?.values[0].value).toBe('General Value');
      });
    });

    it('should return only group fields when entityType is group', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user and group
        testUser = await createTestUser({ db });
        const group = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Test Group',
            slug: 'test-group'
          }
        });

        // Create a group field
        const { data: groupField } = await createCustomField({
          db,
          userId: testUser.id,
          name: 'Group Field',
          fieldType: 'text',
          entityType: 'group',
          groupId: group.id
        });

        // Create a general person field (should not be returned)
        const { data: personField } = await createCustomField({
          db,
          userId: testUser.id,
          name: 'Person Field',
          fieldType: 'text',
          entityType: 'person'
        });

        if (!groupField || !personField) throw new Error('Failed to create fields');

        const result = await getCustomFieldValues({
          db,
          userId: testUser.id,
          entityId: group.id,
          entityType: 'group'
        });

        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        expect(result.data?.fields).toHaveLength(1);
        expect(result.data?.fields[0].name).toBe('Group Field');
      });
    });

    it('should handle dropdown and multi-select fields with options', async () => {
      await withTestTransaction(supabase, async (db) => {
        testUser = await createTestUser({ db });
        const person = await createTestPerson({
          db,
          data: { user_id: testUser.id, first_name: 'Test', last_name: 'Person' }
        });

        // Create a dropdown field with options
        const { data: dropdownField } = await createCustomField({
          db,
          userId: testUser.id,
          name: 'Dropdown Field',
          fieldType: 'dropdown',
          entityType: 'person',
          options: ['Option 1', 'Option 2', 'Option 3']
        });

        if (!dropdownField) throw new Error('Failed to create dropdown field');

        const result = await getCustomFieldValues({
          db,
          userId: testUser.id,
          entityId: person.id,
          entityType: 'person'
        });

        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        expect(result.data?.fields[0].options).toHaveLength(3);
        expect(result.data?.fields[0].options?.map((o) => o.value)).toEqual([
          'Option 1',
          'Option 2',
          'Option 3'
        ]);
      });
    });
  });

  describe('error cases', () => {
    it('should handle database errors gracefully', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await getCustomFieldValues({
          db: null as any,
          userId: 'invalid-user',
          entityId: 'invalid-entity',
          entityType: 'person'
        });

        expect(result.error).toBeDefined();
        expect(result.error?.name).toBe('DATABASE_ERROR');
        expect(result.data).toBeNull();
      });
    });

    it('should handle missing user gracefully', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await getCustomFieldValues({
          db,
          userId: '',
          entityId: 'some-entity',
          entityType: 'person'
        });

        expect(result.error).toBeDefined();
        expect(result.error?.name).toBe('DATABASE_ERROR');
        expect(result.data).toBeNull();
      });
    });
  });
});
