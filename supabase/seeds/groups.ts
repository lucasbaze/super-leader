import { SeedContext } from './types';
import { generateRandomNumber } from './utils';

export async function seedGroups({ supabase, userId }: SeedContext) {
  // First, fetch all existing groups for this user
  const { data: groups, error: groupsError } = await supabase
    .from('group')
    .select('id, name')
    .eq('user_id', userId);

  if (groupsError) throw groupsError;
  if (!groups) throw new Error('No groups found');

  // Create a map of group names to their IDs
  const groupIds = groups.reduce<Record<string, string>>((acc, group) => {
    acc[group.name] = group.id;
    return acc;
  }, {});

  // Get all people IDs
  const { data: people, error: peopleError } = await supabase
    .from('person')
    .select('id')
    .eq('user_id', userId);

  if (peopleError) throw peopleError;
  if (!people) throw new Error('No people found');

  const personIds = people.map((p) => p.id);
  const numberedGroupMemberships = new Set<string>(); // Track only numbered group memberships

  // Helper function to get random unused person IDs for numbered groups
  const getRandomUnusedNumberedGroupIds = (count: number): string[] => {
    const result: string[] = [];
    const availableIds = personIds.filter((id) => !numberedGroupMemberships.has(id));

    for (let i = 0; i < count && availableIds.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableIds.length);
      const selectedId = availableIds.splice(randomIndex, 1)[0];
      result.push(selectedId);
      numberedGroupMemberships.add(selectedId);
    }

    return result;
  };

  // Helper function to get random person IDs for categorical groups
  const getRandomPersonIds = (count: number): string[] => {
    const result: string[] = [];
    const availableIds = [...personIds]; // Create a copy of all person IDs

    for (let i = 0; i < count && availableIds.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableIds.length);
      const selectedId = availableIds.splice(randomIndex, 1)[0];
      result.push(selectedId);
    }

    return result;
  };

  // Assign members to numbered groups (5, 50, 100)
  const groupAssignments = [
    { name: 'Inner 5', count: 5 },
    { name: 'Central 50', count: 20 },
    { name: 'Strategic 100', count: 40 }
  ];

  for (const { name, count } of groupAssignments) {
    const selectedIds = getRandomUnusedNumberedGroupIds(count);
    const groupMembers = selectedIds.map((personId) => ({
      group_id: groupIds[name],
      person_id: personId,
      user_id: userId
    }));

    if (groupMembers.length > 0) {
      const { error: memberError } = await supabase.from('group_member').insert(groupMembers);
      if (memberError) throw memberError;
    }
  }

  // Assign members to categorical groups (School, Work, Community)
  // These match the default groups created by our trigger
  const categoricalGroups = ['School', 'Work', 'Community'] as const;

  for (const groupName of categoricalGroups) {
    const randomCount = generateRandomNumber(1, 10);
    const selectedIds = getRandomPersonIds(randomCount);

    const groupMembers = selectedIds.map((personId) => ({
      group_id: groupIds[groupName],
      person_id: personId,
      user_id: userId
    }));

    if (groupMembers.length > 0) {
      const { error: memberError } = await supabase.from('group_member').insert(groupMembers);
      if (memberError) throw memberError;
    }
  }
}
