import { SupabaseClient } from '@supabase/supabase-js';

import { VALID_ENTITY_TYPES } from '@/lib/custom-fields/constants';
import { createCustomField } from '@/services/custom-fields/create-custom-field';
import { deleteCustomField } from '@/services/custom-fields/delete-custom-field';
import {
  createCustomFieldValue,
  updateCustomFieldValue
} from '@/services/custom-fields/set-custom-field-value';
import { createTestPerson, createTestUser } from '@/tests/test-builder';
import { cleanupAllTestUsers } from '@/tests/utils/cleanup-utils';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { DBClient } from '@/types/database';
import { createClient } from '@/utils/supabase/server';

describe('custom field values', () => {
  let supabase: DBClient;
  let userId: string;
  let personId: string;
  const createdFieldIds: string[] = [];

  beforeAll(async () => {
    supabase = await createClient();
    const testUser = await createTestUser({ db: supabase });
    userId = testUser.id;

    // Create a test person
    const testPerson = await createTestPerson({
      db: supabase,
      data: { user_id: userId, first_name: 'Test', last_name: 'Person' }
    });
    personId = testPerson.id;
  });

  afterAll(async () => {
    // Clean up created fields
    for (const fieldId of createdFieldIds) {
      await deleteCustomField({ db: supabase, userId, fieldId });
    }

    await cleanupAllTestUsers(supabase);
  });

  describe('createCustomFieldValue', () => {
    it('creates a field value successfully', async () => {
      await withTestTransaction(supabase, async (db) => {
        // First create a field
        const createFieldResult = await createCustomField({
          db,
          userId,
          name: 'Test Value Field',
          fieldType: 'text',
          entityType: VALID_ENTITY_TYPES.PERSON
        });

        expect(createFieldResult.error).toBeNull();
        if (createFieldResult.data?.id) {
          createdFieldIds.push(createFieldResult.data.id);
        } else {
          fail('Failed to create field for testing');
        }

        // Create a value for the field
        const createValueResult = await createCustomFieldValue({
          db,
          userId,
          customFieldId: createFieldResult.data!.id,
          entityId: personId,
          value: 'Test Value'
        });

        expect(createValueResult.error).toBeNull();
        expect(createValueResult.data).toBeDefined();
        expect(createValueResult.data?.value).toBe('Test Value');
        expect(createValueResult.data?.customFieldId).toBe(createFieldResult.data!.id);
        expect(createValueResult.data?.entityId).toBe(personId);
      });
    });

    it('updates an existing value when creating with same field and entity', async () => {
      await withTestTransaction(supabase, async (db) => {
        // First create a field
        const createFieldResult = await createCustomField({
          db,
          userId,
          name: 'Update Test Field',
          fieldType: 'text',
          entityType: VALID_ENTITY_TYPES.PERSON
        });

        expect(createFieldResult.error).toBeNull();
        if (createFieldResult.data?.id) {
          createdFieldIds.push(createFieldResult.data.id);
        } else {
          fail('Failed to create field for testing');
        }

        // Create initial value
        const initialValueResult = await createCustomFieldValue({
          db,
          userId,
          customFieldId: createFieldResult.data!.id,
          entityId: personId,
          value: 'Initial Value'
        });

        expect(initialValueResult.error).toBeNull();

        // Create another value for the same field+entity
        const updatedValueResult = await createCustomFieldValue({
          db,
          userId,
          customFieldId: createFieldResult.data!.id,
          entityId: personId,
          value: 'Updated Value'
        });

        expect(updatedValueResult.error).toBeNull();
        expect(updatedValueResult.data).toBeDefined();
        expect(updatedValueResult.data?.value).toBe('Updated Value');
        expect(updatedValueResult.data?.id).toBe(initialValueResult.data?.id);
      });
    });
  });

  describe('updateCustomFieldValue', () => {
    it('updates an existing field value', async () => {
      await withTestTransaction(supabase, async (db) => {
        // First create a field
        const createFieldResult = await createCustomField({
          db,
          userId,
          name: 'Field for Update Test',
          fieldType: 'text',
          entityType: VALID_ENTITY_TYPES.PERSON
        });

        expect(createFieldResult.error).toBeNull();
        if (createFieldResult.data?.id) {
          createdFieldIds.push(createFieldResult.data.id);
        } else {
          fail('Failed to create field for testing');
        }

        // Create initial value
        const createValueResult = await createCustomFieldValue({
          db,
          userId,
          customFieldId: createFieldResult.data!.id,
          entityId: personId,
          value: 'Value to Update'
        });

        expect(createValueResult.error).toBeNull();
        expect(createValueResult.data).toBeDefined();

        // Update the value
        const updateResult = await updateCustomFieldValue({
          db,
          userId,
          fieldValueId: createValueResult.data!.id,
          value: 'Updated Test Value'
        });

        expect(updateResult.error).toBeNull();
        expect(updateResult.data).toBeDefined();
        expect(updateResult.data?.value).toBe('Updated Test Value');
      });
    });

    it('handles non-existent field values', async () => {
      await withTestTransaction(supabase, async (db) => {
        const updateResult = await updateCustomFieldValue({
          db,
          userId,
          fieldValueId: '00000000-0000-0000-0000-000000000000',
          value: 'This value does not exist'
        });

        expect(updateResult.data).toBeNull();
        expect(updateResult.error).toBeDefined();
        expect(updateResult.error?.name).toBe('VALUE_NOT_FOUND');
      });
    });
  });
});
