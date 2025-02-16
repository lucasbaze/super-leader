import { z } from 'zod';

export const contactMethodSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  value: z.string(),
  label: z.string().optional(),
  is_primary: z.boolean().default(false)
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
  is_primary: z.boolean().default(false)
});

export const websiteSchema = z.object({
  id: z.string().optional(),
  url: z.string().url(),
  label: z.string().optional()
});

export const personEditSchema = z.object({
  bio: z.string().optional(),
  contactMethods: z.array(contactMethodSchema),
  addresses: z.array(addressSchema),
  websites: z.array(websiteSchema)
});

export type TPersonEditFormData = z.infer<typeof personEditSchema>;
