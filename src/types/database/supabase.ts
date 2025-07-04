export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      action_plan: {
        Row: {
          action_plan: Json;
          created_at: string;
          id: string;
          state: string;
          user_id: string;
        };
        Insert: {
          action_plan: Json;
          created_at?: string;
          id?: string;
          state: string;
          user_id: string;
        };
        Update: {
          action_plan?: Json;
          created_at?: string;
          id?: string;
          state?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      addresses: {
        Row: {
          city: string | null;
          country: string | null;
          created_at: string;
          id: string;
          is_primary: boolean | null;
          label: string | null;
          person_id: string;
          postal_code: string | null;
          state: string | null;
          street: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          city?: string | null;
          country?: string | null;
          created_at?: string;
          id?: string;
          is_primary?: boolean | null;
          label?: string | null;
          person_id: string;
          postal_code?: string | null;
          state?: string | null;
          street?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          city?: string | null;
          country?: string | null;
          created_at?: string;
          id?: string;
          is_primary?: boolean | null;
          label?: string | null;
          person_id?: string;
          postal_code?: string | null;
          state?: string | null;
          street?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'addresses_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'person';
            referencedColumns: ['id'];
          }
        ];
      };
      contact_methods: {
        Row: {
          created_at: string;
          id: string;
          is_contact_method: boolean | null;
          is_primary: boolean | null;
          label: string | null;
          person_id: string;
          platform_icon: string | null;
          type: string;
          updated_at: string;
          user_id: string;
          value: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_contact_method?: boolean | null;
          is_primary?: boolean | null;
          label?: string | null;
          person_id: string;
          platform_icon?: string | null;
          type: string;
          updated_at?: string;
          user_id: string;
          value: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_contact_method?: boolean | null;
          is_primary?: boolean | null;
          label?: string | null;
          person_id?: string;
          platform_icon?: string | null;
          type?: string;
          updated_at?: string;
          user_id?: string;
          value?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'contact_methods_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'person';
            referencedColumns: ['id'];
          }
        ];
      };
      conversations: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          owner_identifier: string;
          owner_type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name?: string;
          owner_identifier: string;
          owner_type: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          owner_identifier?: string;
          owner_type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      custom_field_options: {
        Row: {
          created_at: string | null;
          custom_field_id: string;
          description: string | null;
          display_order: number;
          id: string;
          updated_at: string | null;
          user_id: string;
          value: string;
        };
        Insert: {
          created_at?: string | null;
          custom_field_id: string;
          description?: string | null;
          display_order: number;
          id?: string;
          updated_at?: string | null;
          user_id: string;
          value: string;
        };
        Update: {
          created_at?: string | null;
          custom_field_id?: string;
          description?: string | null;
          display_order?: number;
          id?: string;
          updated_at?: string | null;
          user_id?: string;
          value?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'custom_field_options_custom_field_id_fkey';
            columns: ['custom_field_id'];
            isOneToOne: false;
            referencedRelation: 'custom_fields';
            referencedColumns: ['id'];
          }
        ];
      };
      custom_field_values: {
        Row: {
          created_at: string | null;
          custom_field_id: string;
          entity_id: string;
          id: string;
          updated_at: string | null;
          user_id: string;
          value: string | null;
        };
        Insert: {
          created_at?: string | null;
          custom_field_id: string;
          entity_id: string;
          id?: string;
          updated_at?: string | null;
          user_id: string;
          value?: string | null;
        };
        Update: {
          created_at?: string | null;
          custom_field_id?: string;
          entity_id?: string;
          id?: string;
          updated_at?: string | null;
          user_id?: string;
          value?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'custom_field_values_custom_field_id_fkey';
            columns: ['custom_field_id'];
            isOneToOne: false;
            referencedRelation: 'custom_fields';
            referencedColumns: ['id'];
          }
        ];
      };
      custom_fields: {
        Row: {
          created_at: string | null;
          display_order: number;
          entity_type: string;
          field_description: string | null;
          field_type: string;
          group_id: string | null;
          id: string;
          name: string;
          permanent: boolean;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          display_order: number;
          entity_type: string;
          field_description?: string | null;
          field_type: string;
          group_id?: string | null;
          id?: string;
          name: string;
          permanent?: boolean;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          display_order?: number;
          entity_type?: string;
          field_description?: string | null;
          field_type?: string;
          group_id?: string | null;
          id?: string;
          name?: string;
          permanent?: boolean;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'custom_fields_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'group';
            referencedColumns: ['id'];
          }
        ];
      };
      files: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          path: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          path: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          path?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      group: {
        Row: {
          created_at: string;
          icon: string;
          id: string;
          name: string;
          slug: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          icon: string;
          id?: string;
          name: string;
          slug: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          icon?: string;
          id?: string;
          name?: string;
          slug?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      group_member: {
        Row: {
          created_at: string;
          group_id: string | null;
          id: string;
          person_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          group_id?: string | null;
          id?: string;
          person_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          group_id?: string | null;
          id?: string;
          person_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'group_person_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'group';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_person_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'person';
            referencedColumns: ['id'];
          }
        ];
      };
      integrated_accounts: {
        Row: {
          account_id: string | null;
          account_name: string;
          account_status: string;
          auth_status: string;
          created_at: string;
          id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          account_id?: string | null;
          account_name: string;
          account_status: string;
          auth_status: string;
          created_at?: string;
          id?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          account_id?: string | null;
          account_name?: string;
          account_status?: string;
          auth_status?: string;
          created_at?: string;
          id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      interactions: {
        Row: {
          created_at: string;
          id: string;
          note: string | null;
          person_id: string | null;
          type: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          note?: string | null;
          person_id?: string | null;
          type?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          note?: string | null;
          person_id?: string | null;
          type?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'interactions_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'person';
            referencedColumns: ['id'];
          }
        ];
      };
      messages: {
        Row: {
          conversation_id: string;
          created_at: string;
          id: string;
          message: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          conversation_id: string;
          created_at?: string;
          id?: string;
          message: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          conversation_id?: string;
          created_at?: string;
          id?: string;
          message?: Json;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          }
        ];
      };
      organization: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          url: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          url?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          url?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      person: {
        Row: {
          ai_summary: Json | null;
          bio: string | null;
          birthday: string | null;
          completeness_score: number | null;
          created_at: string;
          date_met: string | null;
          first_name: string;
          follow_up_score: number;
          id: string;
          last_name: string | null;
          linkedin_public_id: string | null;
          title: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          ai_summary?: Json | null;
          bio?: string | null;
          birthday?: string | null;
          completeness_score?: number | null;
          created_at?: string;
          date_met?: string | null;
          first_name: string;
          follow_up_score?: number;
          id?: string;
          last_name?: string | null;
          linkedin_public_id?: string | null;
          title?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          ai_summary?: Json | null;
          bio?: string | null;
          birthday?: string | null;
          completeness_score?: number | null;
          created_at?: string;
          date_met?: string | null;
          first_name?: string;
          follow_up_score?: number;
          id?: string;
          last_name?: string | null;
          linkedin_public_id?: string | null;
          title?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      person_organization: {
        Row: {
          created_at: string;
          id: string;
          organization_id: string;
          person_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          organization_id: string;
          person_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          organization_id?: string;
          person_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'person_organization_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organization';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'person_organization_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'person';
            referencedColumns: ['id'];
          }
        ];
      };
      person_person_relation: {
        Row: {
          created_at: string;
          edge_person_id: string;
          id: string;
          node_person_id: string;
          note: string | null;
          relation: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          edge_person_id: string;
          id?: string;
          node_person_id: string;
          note?: string | null;
          relation?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          edge_person_id?: string;
          id?: string;
          node_person_id?: string;
          note?: string | null;
          relation?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'people_relations_edge_person_id_fkey';
            columns: ['edge_person_id'];
            isOneToOne: false;
            referencedRelation: 'person';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'people_relations_node_person_id_fkey';
            columns: ['node_person_id'];
            isOneToOne: false;
            referencedRelation: 'person';
            referencedColumns: ['id'];
          }
        ];
      };
      suggestions: {
        Row: {
          bad: boolean;
          created_at: string;
          id: string;
          person_id: string | null;
          saved: boolean;
          suggestion: Json;
          topic: string;
          type: string;
          user_id: string | null;
          viewed: boolean | null;
        };
        Insert: {
          bad?: boolean;
          created_at?: string;
          id?: string;
          person_id?: string | null;
          saved?: boolean;
          suggestion: Json;
          topic: string;
          type?: string;
          user_id?: string | null;
          viewed?: boolean | null;
        };
        Update: {
          bad?: boolean;
          created_at?: string;
          id?: string;
          person_id?: string | null;
          saved?: boolean;
          suggestion?: Json;
          topic?: string;
          type?: string;
          user_id?: string | null;
          viewed?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: 'suggestions_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'person';
            referencedColumns: ['id'];
          }
        ];
      };
      task_suggestion: {
        Row: {
          bad_suggestion: boolean | null;
          bad_suggestion_reason: string | null;
          completed_at: string | null;
          context: Json;
          created_at: string;
          end_at: string;
          id: string;
          person_id: string | null;
          skipped_at: string | null;
          snoozed_at: string | null;
          suggested_action: Json;
          suggested_action_type: string;
          trigger: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          bad_suggestion?: boolean | null;
          bad_suggestion_reason?: string | null;
          completed_at?: string | null;
          context: Json;
          created_at?: string;
          end_at: string;
          id?: string;
          person_id?: string | null;
          skipped_at?: string | null;
          snoozed_at?: string | null;
          suggested_action: Json;
          suggested_action_type: string;
          trigger: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          bad_suggestion?: boolean | null;
          bad_suggestion_reason?: string | null;
          completed_at?: string | null;
          context?: Json;
          created_at?: string;
          end_at?: string;
          id?: string;
          person_id?: string | null;
          skipped_at?: string | null;
          snoozed_at?: string | null;
          suggested_action?: Json;
          suggested_action_type?: string;
          trigger?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'task_suggestion_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'person';
            referencedColumns: ['id'];
          }
        ];
      };
      user_context: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          processed_at: string | null;
          reason: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          processed_at?: string | null;
          reason: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          processed_at?: string | null;
          reason?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_profile: {
        Row: {
          avatar_url: string | null;
          context_summary: Json | null;
          context_summary_completeness_score: number;
          created_at: string;
          first_name: string | null;
          id: string;
          last_name: string | null;
          onboarding: Json | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          avatar_url?: string | null;
          context_summary?: Json | null;
          context_summary_completeness_score?: number;
          created_at?: string;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          onboarding?: Json | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          avatar_url?: string | null;
          context_summary?: Json | null;
          context_summary_completeness_score?: number;
          created_at?: string;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          onboarding?: Json | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      waitlist: {
        Row: {
          created_at: string;
          email: string;
          id: number;
          enabled: boolean;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: number;
          enabled?: boolean;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: number;
          enabled?: boolean;
        };
        Relationships: [];
      };
      websites: {
        Row: {
          created_at: string;
          icon: string | null;
          id: string;
          label: string | null;
          person_id: string;
          updated_at: string;
          url: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          icon?: string | null;
          id?: string;
          label?: string | null;
          person_id: string;
          updated_at?: string;
          url: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          icon?: string | null;
          id?: string;
          label?: string | null;
          person_id?: string;
          updated_at?: string;
          url?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'websites_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'person';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      begin_test_transaction: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      get_everyone_else_completeness_score: {
        Args: {
          p_user_id: string;
          p_core_group_slugs: string[];
        };
        Returns: {
          avg_completeness: number;
          count: number;
        }[];
      };
      get_network_activity_by_period: {
        Args: {
          p_user_id: string;
          p_days: number;
          p_offset: number;
          p_core_group_slugs: string[];
          p_timezone?: string;
        };
        Returns: {
          date: string;
          inner5: number;
          central50: number;
          strategic100: number;
          everyone: number;
        }[];
      };
      get_people_needing_follow_up: {
        Args: {
          p_user_id: string;
          p_group_id: string;
          p_date: string;
        };
        Returns: {
          id: string;
          first_name: string;
          last_name: string;
          user_id: string;
        }[];
      };
      get_people_with_upcoming_birthdays: {
        Args: {
          p_user_id: string;
          p_start_date: string;
          p_end_date: string;
        };
        Returns: {
          id: string;
          first_name: string;
          last_name: string;
          birthday: string;
        }[];
      };
      get_todays_network_activity: {
        Args: {
          p_user_id: string;
          p_core_group_slugs: string[];
          p_timezone?: string;
        };
        Returns: {
          group_name: string;
          interaction_count: number;
          people: Json;
        }[];
      };
      rollback_test_transaction: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views']) | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes'] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
