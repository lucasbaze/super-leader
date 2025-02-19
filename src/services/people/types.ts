import { Group, Person } from '@/types/database';

export type SimpleSearchPeopleResult = Pick<
  Person,
  'id' | 'first_name' | 'last_name' | 'bio' | 'ai_summary'
> & {
  groups: Pick<Group, 'id' | 'name' | 'icon' | 'slug'>[];
};
