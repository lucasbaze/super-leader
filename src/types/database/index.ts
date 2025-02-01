import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from './supabase';

export type DBClient = SupabaseClient;

export * from './supabase';
export * from './supabase-auth';

export type Person = Database['public']['Tables']['person']['Row'];
export type ContactMethod = Database['public']['Tables']['contact_methods']['Row'];
export type Address = Database['public']['Tables']['addresses']['Row'];
export type Website = Database['public']['Tables']['websites']['Row'];
