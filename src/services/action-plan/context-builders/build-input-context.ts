import { DBClient } from '@/types/database';

import { InputAdapter } from '../types';
import { buildContextForPerson } from './build-context-for-person';

interface ContextBuilderParams {
  inputAdapters: InputAdapter<any>[];
  db: DBClient;
  userId: string;
}

export const buildInputContext = async ({ inputAdapters, db, userId }: ContextBuilderParams) => {
  // Get the user's basic information

  // Get the input context from the input adapters

  const peopleToFetchContextFor: string[] = [];
  const inputContextPromises = inputAdapters.map(async (adapter) => {
    const { data, peopleIds } = await adapter.getContextFragments({ db, userId });

    if (!data) {
      return null;
    }

    // Aggregate all the people ids to fetch context for
    peopleToFetchContextFor.push(...peopleIds.flat());

    return `
      Input: ${adapter.id}
      Description: ${adapter.description}
      Tags: ${adapter.tags.join(', ')}
      Context Fragments: ${JSON.stringify(data, null, 2)}
    `;
  });

  const inputContext = (await Promise.all(inputContextPromises)).filter((context) => context !== null).join('\n');

  // TODO: Get the profile and notes about the people that have been selected to possibly follow up with.
  const peopleProfilesPromises = peopleToFetchContextFor.map(async (personId) => {
    const { data: person, error: personError } = await buildContextForPerson({ db, personId, userId });

    if (personError) {
      return null;
    }

    return person;
  });

  const peopleProfiles = (await Promise.all(peopleProfilesPromises)).filter((profile) => profile !== null);

  return {
    inputContext,
    peopleProfiles
  };
};
