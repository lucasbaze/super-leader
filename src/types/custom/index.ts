import { Group, Person } from '../database';

export type SimpleSearchPeopleResult = Pick<
  Person,
  'id' | 'first_name' | 'last_name' | 'bio' | 'ai_summary'
> & {
  groups: Pick<Group, 'name'>[];
};
