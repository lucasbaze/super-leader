import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@/types/database';

type Tables = Database['public']['Tables'];

export type Person = Omit<Tables['person']['Insert'], 'created_at' | 'updated_at'>;

export type Address = Omit<Tables['addresses']['Insert'], 'id' | 'created_at' | 'updated_at'> & {
  postal_code?: string;
};

export type ContactMethod = Omit<
  Tables['contact_methods']['Insert'],
  'id' | 'created_at' | 'updated_at'
>;

export type Website = Omit<Tables['websites']['Insert'], 'id' | 'created_at' | 'updated_at'>;
export type Interaction = Omit<
  Tables['interactions']['Insert'],
  'id' | 'created_at' | 'updated_at'
>;

export interface SeedContext {
  supabase: SupabaseClient<Database>;
  userId: string;
}
