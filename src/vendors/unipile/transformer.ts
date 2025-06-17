import { PersonCreateFormData } from '@/lib/schemas/person-create';

import { UnipileUserRelation } from './types';

export function transformToPersonData(relation: UnipileUserRelation, userId: string): PersonCreateFormData {
  return {
    person: {
      first_name: relation.first_name,
      last_name: relation.last_name,
      title: relation.headline,
      linkedin_public_id: relation.public_identifier
    },
    websites: [
      {
        url: relation.public_profile_url,
        label: 'LinkedIn'
      }
    ]
  };
}
