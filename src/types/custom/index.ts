// TODO: Move to service types
import { Group } from '../database';

export type PersonGroup = Pick<Group, 'id' | 'name' | 'slug' | 'icon'>;
