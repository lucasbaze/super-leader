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
          author_name: string;
          content: string;
          created_at: string;
          id: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          author_name: string;
          content: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          author_name?: string;
          content?: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      person: {
        Row: {
          ai_summary: string | null;
          bio: string | null;
          birthday: string | null;
          created_at: string;
          date_met: string | null;
          first_name: string;
          id: string;
          last_name: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          ai_summary?: string | null;
          bio?: string | null;
          birthday?: string | null;
          created_at?: string;
          date_met?: string | null;
          first_name: string;
          id?: string;
          last_name?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          ai_summary?: string | null;
          bio?: string | null;
          birthday?: string | null;
          created_at?: string;
          date_met?: string | null;
          first_name?: string;
          id?: string;
          last_name?: string | null;
          updated_at?: string;
          user_id?: string | null;
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
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
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
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
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
