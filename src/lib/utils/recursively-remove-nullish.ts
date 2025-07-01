import { RecursiveNonNullable } from '@/types/utils';

/**
 * Recursively removes null, undefined, empty strings, and empty object/array properties from an object.
 * @param obj The object to clean
 * @returns A new object with nullish properties removed
 */

export function recursivelyRemoveNullish<T>(obj: T): RecursiveNonNullable<T> {
  if (obj === null || obj === undefined) {
    return obj as RecursiveNonNullable<T>;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj
      .map((item) => recursivelyRemoveNullish(item))
      .filter(
        (item) => item !== null && item !== undefined && (typeof item !== 'string' || item !== '')
      ) as RecursiveNonNullable<T>;
  }

  // Handle objects
  if (typeof obj === 'object') {
    const result = {} as RecursiveNonNullable<T>;

    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = recursivelyRemoveNullish(value);

      // Skip null, undefined, empty strings, empty objects, and empty arrays
      if (
        cleanedValue !== null &&
        cleanedValue !== undefined &&
        (typeof cleanedValue !== 'string' || cleanedValue !== '') &&
        !(typeof cleanedValue === 'object' && Object.keys(cleanedValue).length === 0) &&
        !(Array.isArray(cleanedValue) && cleanedValue.length === 0)
      ) {
        result[key as keyof RecursiveNonNullable<T>] = cleanedValue;
      }
    }

    return result;
  }

  // Return primitive values as is
  return obj as RecursiveNonNullable<T>;
}
