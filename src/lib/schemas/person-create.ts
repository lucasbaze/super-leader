import { z } from 'zod';

// import { personInsertSchema } from './database';

// Import shared field schemas from person-edit
import {
  addressSchema as baseAddressSchema,
  contactMethodSchema as baseContactMethodSchema,
  personSchema as basePersonSchema,
  websiteSchema
} from './person-edit';
import { removeOptionalMethodFromField } from './utils';

export const personCreateFieldsSchema = basePersonSchema.extend({
  first_name: z.string().min(1, 'First name is required')
});

export const contactMethodCreateSchema = baseContactMethodSchema.extend({
  type: z.string(),
  value: z.string()
});

export const addressCreateSchema = baseAddressSchema.extend({});

export const websiteCreateSchema = websiteSchema.extend({
  url: z.string().min(1, 'URL is required')
});

export const personCreateSchema = z.object({
  person: personCreateFieldsSchema,
  contactMethods: z.array(contactMethodCreateSchema).optional(),
  addresses: z.array(addressCreateSchema).optional(),
  websites: z.array(websiteCreateSchema).optional(),
  note: z.string().optional()
});

export type PersonCreateFormData = z.infer<typeof personCreateSchema>;

/*
 LLM Transform Person Create Schema
*/

const createPersonLLMInputSchema = z.object({
  first_name: z.string().min(1, 'First name is required').describe('The first name of the person'),
  last_name: z.string().optional().nullable().describe('The last name of the person'),
  birthday: z.string().optional().nullable().describe('The birthday of the person formatted as an ISO8601 date'),
  date_met: z.string().optional().nullable().describe('The date met of the person formatted as an ISO8601 date'),
  title: z.string().optional().nullable().describe('The title or how to address the person'),
  linkedin_public_id: z.string().optional().nullable().describe('The LinkedIn public ID of the person')
});

const createAddressLLMInputSchema = z.object({
  street: z.string().optional().nullable().describe('The street address of the person'),
  city: z.string().optional().nullable().describe('The city of the person'),
  state: z.string().optional().nullable().describe('The state of the person'),
  postal_code: z.string().optional().nullable().describe('The postal code of the person'),
  country: z.string().optional().nullable().describe('The country of the person'),
  label: z.string().optional().nullable().describe('The label of the address such as "Home", "Work", "Other"'),
  is_primary: z.boolean().optional().nullable().describe('If true, the address is the primary address')
});

const createWebsiteLLMInputSchema = z.object({
  url: z.string().describe('The URL of the website'),
  label: z
    .string()
    .optional()
    .nullable()
    .describe(
      'The label of the website such as "Personal Website", "Work Website", "Other", "LinkedIn", "Twitter", "Facebook", "Instagram", "YouTube", "Other"'
    )
});

const createContactMethodLLMInputSchema = z.object({
  type: z
    .string()
    .describe(
      'The type of contact method like "email", "phone", "linkedin", "twitter", "facebook", "instagram", "website", "other"'
    ),
  value: z
    .string()
    .describe('The value of the contact method like "john.doe@example.com", "1234567890", "john-doe", "john-doe-123"'),
  label: z
    .string()
    .optional()
    .nullable()
    .describe(
      'The label of the contact method such as "Personal Email", "Work Email", "Personal Phone", "Work Phone", "LinkedIn", "Twitter", "Facebook", "Instagram", "Website", "Other"'
    ),
  is_primary: z.boolean().optional().nullable().describe('If true, the contact method is the primary contact method')
});

export const createExtendedPersonLLMInputSchema = z.object({
  person: createPersonLLMInputSchema,
  addresses: z.array(createAddressLLMInputSchema).optional().nullable(),
  websites: z.array(createWebsiteLLMInputSchema).optional().nullable(),
  contactMethods: z.array(createContactMethodLLMInputSchema).optional().nullable(),
  note: z.string().optional().nullable()
});

export type CreateExtendedPersonLLMInput = z.infer<typeof createExtendedPersonLLMInputSchema>;

/*
 *
 * Without optional fields
 *
 */

const createPersonLLMInputSchemaWithoutOptional = z.object({
  first_name: z.string().min(1, 'First name is required').describe('The first name of the person'),
  last_name: z.string().nullable().describe('The last name of the person'),
  birthday: z.string().nullable().describe('The birthday of the person formatted as an ISO8601 date'),
  date_met: z.string().nullable().describe('The date met of the person formatted as an ISO8601 date'),
  title: z.string().nullable().describe('The title or how to address the person'),
  linkedin_public_id: z.string().nullable().describe('The LinkedIn public ID of the person')
});

const createAddressLLMInputSchemaWithoutOptional = z.object({
  street: z.string().nullable().describe('The street address of the person'),
  city: z.string().nullable().describe('The city of the person'),
  state: z.string().nullable().describe('The state of the person'),
  postal_code: z.string().nullable().describe('The postal code of the person'),
  country: z.string().nullable().describe('The country of the person'),
  label: z.string().nullable().describe('The label of the address such as "Home", "Work", "Other"'),
  is_primary: z.boolean().nullable().describe('If true, the address is the primary address')
});

const createWebsiteLLMInputSchemaWithoutOptional = z.object({
  url: z.string().describe('The URL of the website'),
  label: z
    .string()
    .nullable()
    .describe(
      'The label of the website such as "Personal Website", "Work Website", "Other", "LinkedIn", "Twitter", "Facebook", "Instagram", "YouTube", "Other"'
    )
});

const createContactMethodLLMInputSchemaWithoutOptional = z.object({
  type: z
    .string()
    .describe(
      'The type of contact method like "email", "phone", "linkedin", "twitter", "facebook", "instagram", "website", "other"'
    ),
  value: z
    .string()
    .describe('The value of the contact method like "john.doe@example.com", "1234567890", "john-doe", "john-doe-123"'),
  label: z
    .string()
    .nullable()
    .describe(
      'The label of the contact method such as "Personal Email", "Work Email", "Personal Phone", "Work Phone", "LinkedIn", "Twitter", "Facebook", "Instagram", "Website", "Other"'
    ),
  is_primary: z.boolean().nullable().describe('If true, the contact method is the primary contact method')
});

export const createExtendedPersonLLMInputSchemaWithoutOptional = z.object({
  person: createPersonLLMInputSchemaWithoutOptional,
  addresses: z.array(createAddressLLMInputSchemaWithoutOptional).nullable(),
  websites: z.array(createWebsiteLLMInputSchemaWithoutOptional).nullable(),
  contactMethods: z.array(createContactMethodLLMInputSchemaWithoutOptional).nullable(),
  note: z.string().nullable()
});
