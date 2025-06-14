import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const ERRORS = {
  PERSON_PERSON_RELATIONS: {
    FETCH_ERROR: createError(
      'person_person_relations_fetch_error',
      ErrorType.DATABASE_ERROR,
      'Error fetching person-person relations',
      'Unable to load person-person relations at this time'
    ),
    MISSING_PERSON_ID: createError(
      'missing_person_id',
      ErrorType.VALIDATION_ERROR,
      'Person ID is required',
      'Person identifier is missing'
    )
  }
};

export interface GetPersonPersonRelationsParams {
  db: DBClient;
  personId: string;
}

export type PersonPersonRelationResult = {
  id: string;
  relation: string | null;
  note: string | null;
  first_name: string;
  last_name: string;
  name: string;
};

export type GetPersonPersonRelationsServiceResult = ServiceResponse<PersonPersonRelationResult[]>;

export async function getPersonPersonRelations({
  db,
  personId
}: GetPersonPersonRelationsParams): Promise<GetPersonPersonRelationsServiceResult> {
  try {
    if (!personId) {
      return { data: null, error: ERRORS.PERSON_PERSON_RELATIONS.MISSING_PERSON_ID };
    }

    const { data: relations, error } = await db
      .from('person_person_relation')
      .select(
        `id, relation, note, edge_person_id, node_person_id, edge_person:edge_person_id (first_name, last_name), node_person:node_person_id (first_name, last_name)`
      )
      .or(`edge_person_id.eq.${personId},node_person_id.eq.${personId}`);

    if (error) {
      const serviceError = { ...ERRORS.PERSON_PERSON_RELATIONS.FETCH_ERROR, details: error };
      errorLogger.log(serviceError);
      return { data: null, error: serviceError };
    }

    const result = (relations || []).map((rel: any) => {
      let otherPerson;
      let otherPersonId;
      if (rel.edge_person_id === personId) {
        otherPerson = rel.node_person;
        otherPersonId = rel.node_person_id;
      } else {
        otherPerson = rel.edge_person;
        otherPersonId = rel.edge_person_id;
      }
      const first_name = otherPerson?.first_name ?? '';
      const last_name = otherPerson?.last_name ?? '';
      return {
        id: otherPersonId,
        relation: rel.relation,
        note: rel.note,
        first_name,
        last_name,
        name: `${first_name} ${last_name}`.trim()
      };
    });

    return { data: result, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.PERSON_PERSON_RELATIONS.FETCH_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
