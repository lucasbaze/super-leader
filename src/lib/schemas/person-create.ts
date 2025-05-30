import { z } from 'zod';

// Import shared field schemas from person-edit
import {
  addressSchema as baseAddressSchema,
  contactMethodSchema as baseContactMethodSchema,
  personSchema as basePersonSchema,
  websiteSchema
} from './person-edit';

// For creation, require first_name and user_id in person
export const personCreateFieldsSchema = basePersonSchema.extend({
  first_name: z.string().min(1, 'First name is required'),
  user_id: z.string().min(1, 'User ID is required')
});

// For creation, require is_primary and _delete to always be present (default false)
export const contactMethodCreateSchema = baseContactMethodSchema.extend({
  is_primary: z.boolean().default(false),
  _delete: z.boolean().default(false)
});

export const addressCreateSchema = baseAddressSchema.extend({
  is_primary: z.boolean().default(false),
  _delete: z.boolean().default(false)
});

export const personCreateSchema = z.object({
  person: personCreateFieldsSchema,
  contactMethods: z.array(contactMethodCreateSchema).optional(),
  addresses: z.array(addressCreateSchema).optional(),
  websites: z.array(websiteSchema).optional(),
  note: z.string().optional()
});

export type PersonCreateFormData = z.infer<typeof personCreateSchema>;
