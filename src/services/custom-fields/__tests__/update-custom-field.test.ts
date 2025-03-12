import { VALID_ENTITY_TYPES, VALID_FIELD_TYPES } from '@/lib/custom-fields/constants';
import { createCustomField } from '@/services/custom-fields/create-custom-field';
import { deleteCustomField } from '@/services/custom-fields/delete-custom-field';
import { getCustomFields } from '@/services/custom-fields/get-custom-fields';
import {
  ERRORS as REORDER_ERRORS,
  reorderCustomFields
} from '@/services/custom-fields/reorder-custom-fields';
import { updateCustomField } from '@/services/custom-fields/update-custom-field';
import { createTestUser } from '@/tests/test-builder';
import { cleanupAllTestUsers } from '@/tests/utils/cleanup-utils';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { DBClient } from '@/types/database';
import { createClient } from '@/utils/supabase/server';

import { ERRORS } from '../update-custom-field';

describe('custom field management', () => {
  let supabase: DBClient;
  let userId: string;
  const createdFieldIds: string[] = [];

  beforeAll(async () => {
    supabase = await createClient();
    const testUser = await createTestUser({ db: supabase });
    userId = testUser.id;
  });

  afterAll(async () => {
    // Clean up created fields
    for (const fieldId of createdFieldIds) {
      await deleteCustomField({ db: supabase, userId, fieldId });
    }

    await cleanupAllTestUsers(supabase);
  });

  describe('updateCustomField', () => {
    describe('success cases', () => {
      it('updates a field name', async () => {
        await withTestTransaction(supabase, async (db) => {
          // First create a field
          const createResult = await createCustomField({
            db,
            userId,
            name: 'Field to Update',
            fieldType: VALID_FIELD_TYPES.TEXT,
            entityType: VALID_ENTITY_TYPES.PERSON
          });

          expect(createResult.error).toBeNull();
          if (createResult.data?.id) {
            createdFieldIds.push(createResult.data.id);
          } else {
            fail('Failed to create field for testing');
          }

          // Update the field
          const updateResult = await updateCustomField({
            db,
            userId,
            fieldId: createResult.data!.id,
            name: 'Updated Field Name'
          });

          expect(updateResult.error).toBeNull();
          expect(updateResult.data).toBeDefined();
          expect(updateResult.data?.name).toBe('Updated Field Name');
        });
      });

      it('updates dropdown options', async () => {
        await withTestTransaction(supabase, async (db) => {
          // First create a dropdown field
          const createResult = await createCustomField({
            db,
            userId,
            name: 'Dropdown to Update',
            fieldType: VALID_FIELD_TYPES.DROPDOWN,
            entityType: VALID_ENTITY_TYPES.PERSON,
            options: ['Option 1', 'Option 2']
          });

          expect(createResult.error).toBeNull();
          if (createResult.data?.id) {
            createdFieldIds.push(createResult.data.id);
          } else {
            fail('Failed to create dropdown field for testing');
          }

          // Update the options
          const updateResult = await updateCustomField({
            db,
            userId,
            fieldId: createResult.data!.id,
            name: createResult.data!.name,
            options: ['Option 1', 'Option 3', 'Option 4'] // Changed options
          });

          expect(updateResult.error).toBeNull();
          expect(updateResult.data).toBeDefined();
          expect(updateResult.data?.options).toHaveLength(3);

          // Check that the options were updated correctly
          const optionValues = updateResult.data?.options?.map((o) => o.value);
          expect(optionValues).toContain('Option 1');
          expect(optionValues).toContain('Option 3');
          expect(optionValues).toContain('Option 4');
          expect(optionValues).not.toContain('Option 2');
        });
      });
    });

    describe('error cases', () => {
      it('handles duplicate field names', async () => {
        await withTestTransaction(supabase, async (db) => {
          // Create two fields
          const field1Result = await createCustomField({
            db,
            userId,
            name: 'First Field',
            fieldType: VALID_FIELD_TYPES.TEXT,
            entityType: VALID_ENTITY_TYPES.PERSON
          });

          const field2Result = await createCustomField({
            db,
            userId,
            name: 'Second Field',
            fieldType: VALID_FIELD_TYPES.TEXT,
            entityType: VALID_ENTITY_TYPES.PERSON
          });

          if (field1Result.data?.id && field2Result.data?.id) {
            createdFieldIds.push(field1Result.data.id, field2Result.data.id);
          } else {
            fail('Failed to create test fields');
          }

          // Try to update field2 to have the same name as field1
          const updateResult = await updateCustomField({
            db,
            userId,
            fieldId: field2Result.data!.id,
            name: 'First Field'
          });

          expect(updateResult.data).toBeNull();
          expect(updateResult.error).toBeDefined();
          expect(updateResult.error?.name).toBe('FIELD_NAME_EXISTS');
        });
      });

      it('handles non-existent field IDs', async () => {
        await withTestTransaction(supabase, async (db) => {
          const updateResult = await updateCustomField({
            db,
            userId,
            fieldId: '00000000-0000-0000-0000-000000000000',
            name: 'This field does not exist'
          });

          expect(updateResult.data).toBeNull();
          expect(updateResult.error).toBeDefined();
          expect(updateResult.error?.name).toBe(ERRORS.FIELD_NOT_FOUND.name);
        });
      });
    });
  });

  describe('reorderCustomFields', () => {
    it('successfully reorders multiple custom fields', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db: supabase });
        const newUserId = testUser.id;

        // Create three test fields
        const field1 = await createCustomField({
          db,
          userId: newUserId,
          name: 'First Field',
          fieldType: VALID_FIELD_TYPES.TEXT,
          entityType: VALID_ENTITY_TYPES.PERSON
        });

        const field2 = await createCustomField({
          db,
          userId: newUserId,
          name: 'Second Field',
          fieldType: VALID_FIELD_TYPES.TEXT,
          entityType: VALID_ENTITY_TYPES.PERSON
        });

        const field3 = await createCustomField({
          db,
          userId: newUserId,
          name: 'Third Field',
          fieldType: VALID_FIELD_TYPES.TEXT,
          entityType: VALID_ENTITY_TYPES.PERSON
        });

        expect(field1.error).toBeNull();
        expect(field2.error).toBeNull();
        expect(field3.error).toBeNull();

        if (field1.data?.id && field2.data?.id && field3.data?.id) {
          createdFieldIds.push(field1.data.id, field2.data.id, field3.data.id);

          // Reorder the fields (3, 1, 2)
          const reorderResult = await reorderCustomFields({
            db,
            userId: newUserId,
            fieldIds: [field3.data.id, field1.data.id, field2.data.id]
          });

          expect(reorderResult.error).toBeNull();
          expect(reorderResult.data?.success).toBe(true);

          // Verify the new order using getCustomFields
          const getResult = await getCustomFields({
            db,
            userId: newUserId,
            entityType: VALID_ENTITY_TYPES.PERSON
          });

          expect(getResult.error).toBeNull();
          expect(getResult.data).toBeDefined();

          // Check if fields are in the correct order
          const orderedFields = getResult.data?.sort((a, b) => a.displayOrder - b.displayOrder);
          expect(orderedFields?.[0].id).toBe(field3.data.id);
          expect(orderedFields?.[1].id).toBe(field1.data.id);
          expect(orderedFields?.[2].id).toBe(field2.data.id);
        }
      });
    });

    it('handles reordering fields with different entity types', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db: supabase });
        const newUserId = testUser.id;

        // Create fields with different entity types
        const personField = await createCustomField({
          db,
          userId: newUserId,
          name: 'Person Field',
          fieldType: VALID_FIELD_TYPES.TEXT,
          entityType: VALID_ENTITY_TYPES.PERSON
        });

        const groupField = await createCustomField({
          db,
          userId: newUserId,
          name: 'Group Field',
          fieldType: VALID_FIELD_TYPES.TEXT,
          entityType: VALID_ENTITY_TYPES.GROUP
        });

        expect(personField.error).toBeNull();
        expect(groupField.error).toBeNull();

        if (personField.data?.id && groupField.data?.id) {
          createdFieldIds.push(personField.data.id, groupField.data.id);

          // Reorder the fields
          const reorderResult = await reorderCustomFields({
            db,
            userId: newUserId,
            fieldIds: [groupField.data.id, personField.data.id]
          });

          expect(reorderResult.error).toBeNull();
          expect(reorderResult.data?.success).toBe(true);

          // Verify order for person fields
          const getPersonFields = await getCustomFields({
            db,
            userId: newUserId,
            entityType: VALID_ENTITY_TYPES.PERSON
          });

          // Verify order for group fields
          const getGroupFields = await getCustomFields({
            db,
            userId: newUserId,
            entityType: VALID_ENTITY_TYPES.GROUP
          });

          expect(getPersonFields.data?.[0].id).toBe(personField.data.id);
          expect(getGroupFields.data?.[0].id).toBe(groupField.data.id);
        }
      });
    });

    describe('error cases', () => {
      it('handles non-existent field IDs', async () => {
        await withTestTransaction(supabase, async (db) => {
          const field = await createCustomField({
            db,
            userId,
            name: 'Test Field',
            fieldType: VALID_FIELD_TYPES.TEXT,
            entityType: VALID_ENTITY_TYPES.PERSON
          });

          expect(field.error).toBeNull();
          if (field.data?.id) {
            createdFieldIds.push(field.data.id);

            const reorderResult = await reorderCustomFields({
              db,
              userId,
              fieldIds: [
                field.data.id,
                '00000000-0000-0000-0000-000000000000' // Non-existent ID
              ]
            });

            expect(reorderResult.data).toBeNull();
            expect(reorderResult.error).toBeDefined();
            expect(reorderResult.error?.name).toBe(REORDER_ERRORS.FIELD_NOT_FOUND.name);
          }
        });
      });

      it('handles empty field ID array', async () => {
        await withTestTransaction(supabase, async (db) => {
          const reorderResult = await reorderCustomFields({
            db,
            userId,
            fieldIds: []
          });

          expect(reorderResult.data).toBeNull();
          expect(reorderResult.error).toBeDefined();
          expect(reorderResult.error?.name).toBe(REORDER_ERRORS.EMPTY_FIELD_IDS.name);
        });
      });

      it('handles fields belonging to different users', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db: supabase });
          const newUserId = testUser.id;

          // Create a field
          const field = await createCustomField({
            db,
            userId: newUserId,
            name: 'Test Field',
            fieldType: VALID_FIELD_TYPES.TEXT,
            entityType: VALID_ENTITY_TYPES.PERSON
          });

          expect(field.error).toBeNull();
          if (field.data?.id) {
            createdFieldIds.push(field.data.id);

            // Try to reorder with a different user
            const otherUser = await createTestUser({ db });
            const reorderResult = await reorderCustomFields({
              db,
              userId: otherUser.id,
              fieldIds: [field.data.id]
            });

            expect(reorderResult.data).toBeNull();
            expect(reorderResult.error).toBeDefined();
            expect(reorderResult.error?.name).toBe(REORDER_ERRORS.FIELD_NOT_FOUND.name);
          }
        });
      });
    });
  });
});
