// TODO: Move to service types
import { Group } from '../database';

export type TPersonGroup = Pick<Group, 'id' | 'name' | 'slug' | 'icon'>;
