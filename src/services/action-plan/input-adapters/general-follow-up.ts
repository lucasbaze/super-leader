import { InputAdapter } from '../types';
import { getPeopleForFollowup, GetPeopleForFollowupResult } from './get-people-for-followup';

export const needsFollowUpAdapter: InputAdapter<GetPeopleForFollowupResult> = {
  id: 'needs-follow-up',
  description: 'People that generally could use a follow up',
  tags: ['follow-up', 'general', 'content-suggestion', 'last-touch'],
  async getContextFragments({ db, userId }) {
    const { data, error: getPeopleError } = await getPeopleForFollowup({ db, userId });

    if (getPeopleError) {
      return { peopleIds: [], data: null };
    }

    return { peopleIds: data?.personIds ?? [], data };
  }
};
