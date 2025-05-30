import { z } from 'zod';

export const personSchema = z.object({
  id: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  birthday: z.string().optional(),
  date_met: z.string().optional(),
  title: z.string().optional()
  // TODO: Add title
});

export const contactMethodSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  value: z.string(),
  label: z.string().optional(),
  is_primary: z.boolean().optional().default(false),
  _delete: z.boolean().optional().default(false).describe('If true, the contact method will be deleted')
});

export const addressSchema = z.object({
  id: z.string().optional(),
  street: z
    .string()
    .nullish()
    .transform((val) => val || ''),
  city: z
    .string()
    .nullish()
    .transform((val) => val || ''),
  state: z
    .string()
    .nullish()
    .transform((val) => val || ''),
  postal_code: z
    .string()
    .nullish()
    .transform((val) => val || ''),
  country: z
    .string()
    .nullish()
    .transform((val) => val || ''),
  label: z
    .string()
    .nullish()
    .transform((val) => val || ''),
  is_primary: z.boolean().optional().default(false),
  _delete: z.boolean().optional().default(false).describe('If true, the address will be deleted')
});

export const websiteSchema = z.object({
  id: z.string().optional(),
  url: z.string().url().optional(),
  label: z.string().optional(),
  _delete: z.boolean().optional().default(false).describe('If true, the website will be deleted')
});

export const personEditSchema = z.object({
  person: personSchema.optional(),
  contactMethods: z.array(contactMethodSchema).optional(),
  addresses: z.array(addressSchema).optional(),
  websites: z.array(websiteSchema).optional()
});

export type PersonEditFormData = z.infer<typeof personEditSchema>;
