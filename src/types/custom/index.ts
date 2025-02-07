import { Group, Person } from '../database';

export type SimpleSearchPeopleResult = Pick<
  Person,
  'id' | 'first_name' | 'last_name' | 'bio' | 'ai_summary'
> & {
  groups: Pick<Group, 'id' | 'name' | 'icon' | 'slug'>[];
};

export type TPersonGroup = Pick<Group, 'id' | 'name' | 'slug' | 'icon'>;
