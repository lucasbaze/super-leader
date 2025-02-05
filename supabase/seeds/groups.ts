import { SeedContext } from './types';
import { generateRandomNumber } from './utils';

const DEFAULT_GROUPS = [
  { name: 'Inner 5', icon: '5' },
  { name: 'Central 50', icon: '50' },
  { name: 'Strategic 100', icon: '100' },
  { name: 'School', icon: '🎓' },
  { name: 'Work', icon: '💼' },
  { name: 'Community', icon: '🏘️' }
] as const;

// Utility function to generate a URL-safe slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

export async function seedGroups({ supabase, userId }: SeedContext) {
  const groupIds: Record<string, string> = {};

  // Create the default groups
  for (const group of DEFAULT_GROUPS) {
    const slug = generateSlug(group.name);
    const { data: insertedGroup, error: groupError } = await supabase
      .from('group')
      .insert({
        name: group.name,
        icon: group.icon,
        slug,
        user_id: userId
      })
      .select('id')
      .single();

    if (groupError) throw groupError;
    if (!insertedGroup) throw new Error(`Failed to create group ${group.name}`);

    groupIds[group.name] = insertedGroup.id;
  }

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
  const categoricalGroups = ['School', 'Work', 'Community'];

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
