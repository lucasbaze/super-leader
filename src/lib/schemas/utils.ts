import { z, ZodObject, ZodRawShape, ZodTypeAny } from 'zod';

/**
 * Rebuilds selected fields from a Zod schema, removing `.optional()` while preserving `.nullable()`.
 */
export function removeOptionalMethodFromField<
  T extends ZodObject<ZodRawShape>,
  K extends Extract<keyof T['shape'], string>
>(
  schema: T,
  keys: readonly K[]
): ZodObject<{
  [P in K]: T['shape'][P] extends z.ZodOptional<infer U> ? U : T['shape'][P];
}> {
  const shape = schema.shape;

  const newShape = {} as any;

  for (const key of keys) {
    const field = shape[key];

    if (field.isOptional?.()) {
      // Remove .optional(), but preserve nullability
      const unwrapped = (field._def.innerType || field) as ZodTypeAny;
      newShape[key] = unwrapped;
    } else {
      newShape[key] = field;
    }
  }

  return z.object(newShape) as any;
}

// TODO: Type check test cases
// const testSchema = z.object({
//   name: z.string().nullable().optional(),
//   age: z.number().optional(),
//   isActive: z.boolean().optional()
// });

// const testSchema2 = removeOptionalFields(testSchema, ['name', 'age']);

// const compareSchema = z.object({
//   name: z.string().nullable(),
//   age: z.number().nullable()
// });

// console.log(testSchema2.shape);

// const testMethod = (schema: z.infer<typeof compareSchema>) => {};

// const outputMethod = (): z.infer<typeof testSchema2> => {
//   return {
//     name: 'John',
//     age: 30
//   };
// };

// testMethod(outputMethod());
