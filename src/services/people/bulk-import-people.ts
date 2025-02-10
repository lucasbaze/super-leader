import { z } from 'zod';

import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import {
  Address,
  ContactMethod,
  DBClient,
  Group,
  Interaction,
  Person,
  Website
} from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

// Define the expected input format for a single person
export interface TBulkImportPerson {
  // Core person data
  first_name: Person['first_name'];
  last_name?: Person['last_name'];
  bio?: Person['bio'];
  birthday?: Person['birthday'];
  date_met?: Person['date_met'];

  // Related data
  addresses?: Pick<
    Address,
    'street' | 'city' | 'state' | 'postal_code' | 'country' | 'label' | 'is_primary'
  >[];

  contact_methods?: Pick<
    ContactMethod,
    'type' | 'value' | 'label' | 'is_primary' | 'platform_icon'
  >[];

  websites?: Pick<Website, 'url' | 'label' | 'icon'>[];

  groups?: {
    name: Group['name'];
    slug?: Group['slug'];
    icon?: Group['icon'];
  }[];

  // Multiple notes instead of single initial_note
  interactions?: {
    type: Interaction['type'];
    note: Interaction['note'];
  }[];
}

export interface TBulkImportError {
  index: number;
  person: TBulkImportPerson;
  error: string;
  type: 'person' | 'address' | 'contact' | 'website' | 'group' | 'note';
  details?: unknown;
}

export interface TBulkImportResult {
  successful: number;
  failed: number;
  errors: TBulkImportError[];
  partialFailures: TBulkImportError[];
}

export interface TBulkImportPeopleParams {
  db: DBClient;
  userId: string;
  people: TBulkImportPerson[];
}

export const ERRORS = {
  BULK_IMPORT: {
    VALIDATION_ERROR: createError(
      'bulk_import_validation_error',
      ErrorType.VALIDATION_ERROR,
      'Invalid import data',
      'Some records could not be imported due to validation errors'
    ),
    IMPORT_ERROR: createError(
      'bulk_import_error',
      ErrorType.DATABASE_ERROR,
      'Error during bulk import',
      'There was a problem importing your contacts'
    )
  }
};

// Add validation schemas
const ImportAddressSchema = z
  .object({
    street: z.string().nullable(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    postal_code: z.string().nullable(),
    country: z.string().nullable(),
    label: z.string().nullable(),
    is_primary: z.boolean().nullable()
  })
  .strict();

const ImportContactMethodSchema = z
  .object({
    type: z.string(),
    value: z.string(),
    label: z.string().nullable(),
    is_primary: z.boolean().nullable(),
    platform_icon: z.string().nullable()
  })
  .strict();

const ImportWebsiteSchema = z
  .object({
    url: z.string(),
    label: z.string().nullable(),
    icon: z.string().nullable()
  })
  .strict();

const ImportGroupSchema = z
  .object({
    name: z.string(),
    slug: z.string().optional(),
    icon: z.string().optional()
  })
  .strict();

const ImportInteractionSchema = z
  .object({
    type: z.string().nullable(),
    note: z.string()
  })
  .strict();

export const ImportPersonSchema = z
  .object({
    first_name: z.string(),
    last_name: z.string().optional(),
    bio: z.string().optional(),
    birthday: z.string().optional(),
    date_met: z.string().optional(),
    contact_methods: z.array(ImportContactMethodSchema).optional(),
    addresses: z.array(ImportAddressSchema).optional(),
    websites: z.array(ImportWebsiteSchema).optional(),
    groups: z.array(ImportGroupSchema).optional(),
    interactions: z.array(ImportInteractionSchema).optional()
  })
  .strict();

export type TImportPerson = z.infer<typeof ImportPersonSchema>;

export const ImportPeopleSchema = z.array(ImportPersonSchema);

export async function bulkImportPeople({
  db,
  userId,
  people
}: TBulkImportPeopleParams): Promise<TServiceResponse<TBulkImportResult>> {
  const result: TBulkImportResult = {
    successful: 0,
    failed: 0,
    errors: [],
    partialFailures: []
  };

  try {
    for (let i = 0; i < people.length; i++) {
      const person = people[i];
      let personId: string | null = null;

      // Validate person data
      const validationResult = ImportPersonSchema.safeParse(person);

      if (!validationResult.success) {
        result.failed++;
        result.errors.push({
          index: i,
          person,
          error: 'Validation failed',
          type: 'person',
          details: validationResult.error.format()
        });
        continue;
      }

      try {
        // Rest of the import logic stays the same...
        // Use validationResult.data instead of person to ensure type safety
        const validatedPerson = validationResult.data;

        const { data: insertedPerson, error: personError } = await db
          .from('person')
          .insert({
            user_id: userId,
            first_name: validatedPerson.first_name,
            last_name: validatedPerson.last_name,
            bio: validatedPerson.bio,
            birthday: validatedPerson.birthday,
            date_met: validatedPerson.date_met
          })
          .select()
          .single();

        if (personError || !insertedPerson) {
          result.failed++;
          result.errors.push({
            index: i,
            person,
            error: personError?.message || 'Failed to create person',
            type: 'person',
            details: personError
          });
          continue;
        }

        personId = insertedPerson.id;

        // 2. Insert addresses if any
        if (validatedPerson.addresses?.length) {
          const { error: addressError } = await db.from('addresses').insert(
            validatedPerson.addresses.map((addr) => ({
              person_id: personId,
              user_id: userId,
              ...addr
            }))
          );

          if (addressError) {
            result.partialFailures.push({
              index: i,
              person,
              error: addressError.message,
              type: 'address',
              details: addressError
            });
          }
        }

        // 3. Insert contact methods if any
        if (validatedPerson.contact_methods?.length) {
          const { error: contactError } = await db.from('contact_methods').insert(
            validatedPerson.contact_methods.map((contact) => ({
              person_id: personId,
              user_id: userId,
              ...contact
            }))
          );

          if (contactError) {
            result.partialFailures.push({
              index: i,
              person,
              error: contactError.message,
              type: 'contact',
              details: contactError
            });
          }
        }

        // 4. Insert websites if any
        if (validatedPerson.websites?.length) {
          const { error: websiteError } = await db.from('websites').insert(
            validatedPerson.websites.map((website) => ({
              person_id: personId,
              user_id: userId,
              ...website
            }))
          );

          if (websiteError) {
            result.partialFailures.push({
              index: i,
              person,
              error: websiteError.message,
              type: 'website',
              details: websiteError
            });
          }
        }

        // 5. Handle groups
        if (validatedPerson.groups?.length) {
          for (const group of validatedPerson.groups) {
            try {
              // First try to find existing group
              const { data: existingGroup } = await db
                .from('group')
                .select('id')
                .eq('user_id', userId)
                .eq('name', group.name)
                .single();

              let groupId: string;

              if (existingGroup) {
                groupId = existingGroup.id;
              } else {
                // Create new group if doesn't exist
                const { data: newGroup, error: groupError } = await db
                  .from('group')
                  .insert({
                    user_id: userId,
                    name: group.name,
                    slug: group.slug || group.name.toLowerCase().replace(/\s+/g, '-'),
                    icon: group.icon
                  })
                  .select()
                  .single();

                if (groupError || !newGroup) throw groupError;
                groupId = newGroup.id;
              }

              // Add person to group
              const { error: memberError } = await db.from('group_member').insert({
                group_id: groupId,
                person_id: personId,
                user_id: userId
              });

              if (memberError) {
                result.partialFailures.push({
                  index: i,
                  person,
                  error: memberError.message,
                  type: 'group',
                  details: memberError
                });
              }
            } catch (groupError) {
              result.partialFailures.push({
                index: i,
                person,
                error: groupError instanceof Error ? groupError.message : 'Group creation failed',
                type: 'group',
                details: groupError
              });
            }
          }
        }

        // 6. Create notes if provided
        if (validatedPerson.interactions?.length) {
          for (const interaction of validatedPerson.interactions) {
            const { error: noteError } = await db.from('interactions').insert({
              person_id: personId,
              user_id: userId,
              type: interaction.type || 'note',
              note: interaction.note
            });

            if (noteError) {
              result.partialFailures.push({
                index: i,
                person,
                error: noteError.message,
                type: 'note',
                details: noteError
              });
            }
          }
        }

        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          index: i,
          person,
          error: error instanceof Error ? error.message : 'Unknown error',
          type: 'person',
          details: error
        });
      }
    }

    // If we had any failures, return a validation error with all error details
    if (result.failed > 0 || result.partialFailures.length > 0) {
      return {
        data: result,
        error: {
          ...ERRORS.BULK_IMPORT.VALIDATION_ERROR,
          details: {
            errors: result.errors,
            partialFailures: result.partialFailures
          }
        }
      };
    }

    return { data: result, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.BULK_IMPORT.IMPORT_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
