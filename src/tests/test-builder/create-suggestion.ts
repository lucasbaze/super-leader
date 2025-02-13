import { randomString } from '@/lib/utils';
import { SuggestionType } from '@/services/suggestions/types';
import { DBClient } from '@/types/database';

interface CreateTestSuggestionParams {
  db: DBClient;
  data?: {
    user_id?: string;
    person_id?: string;
    suggestion?: any; // This is a JSON field that can contain various suggestion data
    type?: string;
    viewed?: boolean;
    saved?: boolean;
    bad?: boolean;
  };
}

export async function createTestSuggestion({ db, data = {} }: CreateTestSuggestionParams) {
  const random = randomString();
  const defaultData = {
    user_id: data.user_id || 'default-user-id',
    person_id: data.person_id || 'default-person-id',
    suggestion: data.suggestion || {
      text: `Test suggestion text ${random}`,
      contentUrl: `https://example.com/${random}`,
      contentTitle: `Test Content ${random}`
    },
    type: data.type || SuggestionType.Enum.content,
    viewed: data.viewed ?? false,
    saved: data.saved ?? false,
    bad: data.bad ?? false
  };

  const { data: suggestion, error } = await db
    .from('suggestions')
    .insert(defaultData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test suggestion: ${error.message}`);
  }

  return suggestion;
}
