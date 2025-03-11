import {
  VALID_ENTITY_TYPES,
  VALID_ENTITY_TYPES_LIST,
  VALID_FIELD_TYPES,
  VALID_FIELD_TYPES_LIST
} from '@/lib/custom-fields/constants';
import { createCustomField } from '@/services/custom-fields/create-custom-field';
import { deleteCustomField } from '@/services/custom-fields/delete-custom-field';
import { getCustomFields } from '@/services/custom-fields/get-custom-fields';
import { createTestGroup, createTestUser } from '@/tests/test-builder';
import { cleanupAllTestUsers } from '@/tests/utils/cleanup-utils';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { DBClient } from '@/types/database';
import { createClient } from '@/utils/supabase/server';

describe('createCustomField', () => {
  let supabase: DBClient;
  let userId: string;
  let groupId: string;
  const createdFieldIds: string[] = [];

  beforeAll(async () => {
    supabase = await createClient();
    const testUser = await createTestUser({ db: supabase });
    userId = testUser.id;
    const testGroup = await createTestGroup({
      db: supabase,
      data: { name: 'Test Group', user_id: userId, slug: 'test-group' }
    });
    groupId = testGroup.id;
  });

  afterAll(async () => {
    // Clean up created fields
    for (const fieldId of createdFieldIds) {
      await deleteCustomField({ db: supabase, userId, fieldId });
    }

    await cleanupAllTestUsers(supabase);
  });

  describe('success cases', () => {
    // Test creating fields for each valid field type
    VALID_FIELD_TYPES_LIST.forEach((fieldType) => {
      it(`creates a ${fieldType} field and verifies it can be retrieved`, async () => {
        await withTestTransaction(supabase, async (db) => {
          const fieldName = `Test ${fieldType} Field`;
          const options = ['Option 1', 'Option 2', 'Option 3'];

          const createResult = await createCustomField({
            db,
            userId,
            name: fieldName,
            fieldType,
            entityType: VALID_ENTITY_TYPES.PERSON,
            options: fieldType === 'dropdown' || fieldType === 'multi-select' ? options : undefined
          });

          expect(createResult.error).toBeNull();
          expect(createResult.data).toBeDefined();
          expect(createResult.data?.name).toBe(fieldName);
          expect(createResult.data?.fieldType).toBe(fieldType);

          if (createResult.data?.id) {
            createdFieldIds.push(createResult.data.id);

            // Verify the field can be retrieved
            const getResult = await getCustomFields({
              db,
              userId,
              entityType: VALID_ENTITY_TYPES.PERSON
            });

            expect(getResult.error).toBeNull();
            const createdField = getResult.data?.find(
              (field) => field.id === createResult.data?.id
            );
            expect(createdField).toBeDefined();
            expect(createdField?.name).toBe(fieldName);
            expect(createdField?.fieldType).toBe(fieldType);

            // Verify options for dropdown and multi-select fields
            if (
              fieldType === VALID_FIELD_TYPES.DROPDOWN ||
              fieldType === VALID_FIELD_TYPES.MULTI_SELECT
            ) {
              expect(createdField?.options).toHaveLength(3);
              expect(createdField?.options?.map((opt) => opt.value)).toEqual(options);
            }
          }
        });
      });
    });

    // Test creating fields for different entity types
    VALID_ENTITY_TYPES_LIST.forEach((entityType) => {
      it(`creates a field for entity type ${entityType}`, async () => {
        await withTestTransaction(supabase, async (db) => {
          const fieldName = `Test ${entityType} Field`;
          const createResult = await createCustomField({
            db,
            userId,
            name: fieldName,
            fieldType: VALID_FIELD_TYPES.TEXT,
            entityType,
            groupId: entityType === VALID_ENTITY_TYPES.GROUP ? groupId : undefined
          });

          expect(createResult.error).toBeNull();
          expect(createResult.data).toBeDefined();
          expect(createResult.data?.entityType).toBe(entityType);

          if (createResult.data?.id) {
            createdFieldIds.push(createResult.data.id);
          }
        });
      });
    });

    it('creates a field with maximum length name (255 characters)', async () => {
      await withTestTransaction(supabase, async (db) => {
        const maxLengthName = 'A'.repeat(255);
        const result = await createCustomField({
          db,
          userId,
          name: maxLengthName,
          fieldType: VALID_FIELD_TYPES.TEXT,
          entityType: VALID_ENTITY_TYPES.PERSON
        });

        expect(result.error).toBeNull();
        expect(result.data?.name).toBe(maxLengthName);

        if (result.data?.id) {
          createdFieldIds.push(result.data.id);
        }
      });
    });

    it('creates a field with special characters in name', async () => {
      await withTestTransaction(supabase, async (db) => {
        const specialName = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const result = await createCustomField({
          db,
          userId,
          name: specialName,
          fieldType: VALID_FIELD_TYPES.TEXT,
          entityType: VALID_ENTITY_TYPES.PERSON
        });

        expect(result.error).toBeNull();
        expect(result.data?.name).toBe(specialName);

        if (result.data?.id) {
          createdFieldIds.push(result.data.id);
        }
      });
    });
  });

  describe('error cases', () => {
    it('handles duplicate field names', async () => {
      await withTestTransaction(supabase, async (db) => {
        // First create a field
        const field1Result = await createCustomField({
          db,
          userId,
          name: 'Duplicate Field',
          fieldType: VALID_FIELD_TYPES.TEXT,
          entityType: VALID_ENTITY_TYPES.PERSON
        });

        if (field1Result.data?.id) {
          createdFieldIds.push(field1Result.data.id);
        }

        // Try to create another with the same name
        const field2Result = await createCustomField({
          db,
          userId,
          name: 'Duplicate Field',
          fieldType: VALID_FIELD_TYPES.TEXT,
          entityType: VALID_ENTITY_TYPES.PERSON
        });

        expect(field2Result.data).toBeNull();
        expect(field2Result.error?.name).toBe('FIELD_NAME_EXISTS');
      });
    });

    it('validates field types', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await createCustomField({
          db,
          userId,
          name: 'Invalid Field Type',
          fieldType: 'invalid' as any,
          entityType: VALID_ENTITY_TYPES.PERSON
        });

        expect(result.data).toBeNull();
        expect(result.error?.name).toBe('INVALID_FIELD_TYPE');
      });
    });

    it('requires options for dropdown fields', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await createCustomField({
          db,
          userId,
          name: 'Dropdown Without Options',
          fieldType: VALID_FIELD_TYPES.DROPDOWN,
          entityType: VALID_ENTITY_TYPES.PERSON,
          options: []
        });

        expect(result.data).toBeNull();
        expect(result.error?.name).toBe('OPTIONS_REQUIRED');
      });
    });

    it('validates entity type', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await createCustomField({
          db,
          userId,
          name: 'Invalid Entity Type',
          fieldType: VALID_FIELD_TYPES.TEXT,
          entityType: 'invalid' as any
        });

        expect(result.data).toBeNull();
        expect(result.error?.name).toBe('INVALID_ENTITY_TYPE');
      });
    });

    it('handles name exceeding maximum length', async () => {
      await withTestTransaction(supabase, async (db) => {
        const tooLongName = 'A'.repeat(256);
        const result = await createCustomField({
          db,
          userId,
          name: tooLongName,
          fieldType: VALID_FIELD_TYPES.TEXT,
          entityType: VALID_ENTITY_TYPES.PERSON
        });

        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
      });
    });
  });
});
