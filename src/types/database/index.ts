import { SupabaseClient } from '@supabase/supabase-js';

import { Onboarding } from '../custom';
import { Database } from './supabase';

export type DBClient = SupabaseClient;

export * from './supabase';
export * from './supabase-auth';

export type Person = Database['public']['Tables']['person']['Row'];
export type ContactMethod = Database['public']['Tables']['contact_methods']['Row'];
export type Address = Database['public']['Tables']['addresses']['Row'];
export type Website = Database['public']['Tables']['websites']['Row'];
export type Group = Database['public']['Tables']['group']['Row'];
export type GroupMember = Database['public']['Tables']['group_member']['Row'];
export type Interaction = Database['public']['Tables']['interactions']['Row'];
export type Suggestion = Database['public']['Tables']['suggestions']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type TaskSuggestion = Database['public']['Tables']['task_suggestion']['Row'];
export type TaskSuggestionInsert = Database['public']['Tables']['task_suggestion']['Insert'];

export type UserProfile = Database['public']['Tables']['user_profile']['Row'] & {
  onboarding: Onboarding;
};
export type UserContext = Database['public']['Tables']['user_context']['Row'];

export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];
export type CustomField = Database['public']['Tables']['custom_fields']['Row'];
