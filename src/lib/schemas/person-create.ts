import { z } from 'zod';

// Import shared field schemas from person-edit
import {
  addressSchema as baseAddressSchema,
  contactMethodSchema as baseContactMethodSchema,
  personSchema as basePersonSchema,
  websiteSchema
} from './person-edit';

export const personCreateFieldsSchema = basePersonSchema.extend({
  first_name: z.string().min(1, 'First name is required'),
  user_id: z.string().min(1, 'User ID is required')
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
