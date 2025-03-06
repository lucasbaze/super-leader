import { createError, errorLogger } from '@/lib/errors';
import { generateSlug } from '@/lib/utils';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const ERRORS = {
  CREATE_SLUG: {
    FAILED: createError(
      'create_slug_failed',
      ErrorType.DATABASE_ERROR,
      'Error creating unique slug',
      'Unable to create unique identifier'
    ),
    MISSING_NAME: createError(
      'missing_name',
      ErrorType.VALIDATION_ERROR,
      'Name is required to create slug',
      'Name is required'
    )
  }
};

export interface CreateUniqueSlugParams {
  db: DBClient;
  name: string;
  userId: string;
  table: string;
}

export async function createUniqueSlug({
  db,
  name,
  table,
  userId
}: CreateUniqueSlugParams): Promise<ServiceResponse<string>> {
  try {
    if (!name) {
      return { data: null, error: ERRORS.CREATE_SLUG.MISSING_NAME };
    }

    let slug = generateSlug(name);
    let counter = 1;
    let isUnique = false;

    while (!isUnique) {
      const currentSlug = counter === 1 ? slug : `${slug}-${counter}`;
      const { data: existing } = await db
        .from(table)
        .select('id')
        .eq('slug', currentSlug)
        .eq('user_id', userId)
        .single();

      if (!existing) {
        slug = currentSlug;
        isUnique = true;
      } else {
        counter++;
      }
    }

    return { data: slug, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.CREATE_SLUG.FAILED, { details: error });
    return { data: null, error: ERRORS.CREATE_SLUG.FAILED };
  }
}
