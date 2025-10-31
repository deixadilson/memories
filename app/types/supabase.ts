export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          memory_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          memory_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          memory_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_comments_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string | null
          id: string
          receiver_id: string
          requester_id: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          receiver_id: string
          requester_id: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          receiver_id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friendships_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string | null
          memory_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          memory_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          memory_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_likes_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      memories: {
        Row: {
          category: Database["public"]["Enums"]["memory_category"]
          created_at: string | null
          date: string
          date_precision: Database["public"]["Enums"]["date_precision"]
          description: string | null
          id: string
          location: string | null
          media_urls: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          visibility: Database["public"]["Enums"]["visibility_type"]
        }
        Insert: {
          category: Database["public"]["Enums"]["memory_category"]
          created_at?: string | null
          date: string
          date_precision: Database["public"]["Enums"]["date_precision"]
          description?: string | null
          id?: string
          location?: string | null
          media_urls?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Update: {
          category?: Database["public"]["Enums"]["memory_category"]
          created_at?: string | null
          date?: string
          date_precision?: Database["public"]["Enums"]["date_precision"]
          description?: string | null
          id?: string
          location?: string | null
          media_urls?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Relationships: []
      }
      memory_list_visibility: {
        Row: {
          list_id: string
          memory_id: string
        }
        Insert: {
          list_id: string
          memory_id: string
        }
        Update: {
          list_id?: string
          memory_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_list_visibility_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "user_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_list_visibility_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_user_tags: {
        Row: {
          memory_id: string
          person_id: string
        }
        Insert: {
          memory_id: string
          person_id: string
        }
        Update: {
          memory_id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_user_tags_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_user_tags_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          creator_id: string
          email: string | null
          full_name: string
          id: string
          invited_at: string | null
          registered_user_id: string | null
          relationship: string | null
        }
        Insert: {
          creator_id: string
          email?: string | null
          full_name: string
          id?: string
          invited_at?: string | null
          registered_user_id?: string | null
          relationship?: string | null
        }
        Update: {
          creator_id?: string
          email?: string | null
          full_name?: string
          id?: string
          invited_at?: string | null
          registered_user_id?: string | null
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "people_registered_user_id_fkey"
            columns: ["registered_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      period_list_visibility: {
        Row: {
          list_id: string
          period_id: string
        }
        Insert: {
          list_id: string
          period_id: string
        }
        Update: {
          list_id?: string
          period_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "period_list_visibility_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "user_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "period_list_visibility_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
        ]
      }
      periods: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          start_date: string
          title: string
          type: Database["public"]["Enums"]["period_type"]
          updated_at: string | null
          user_id: string
          visibility: Database["public"]["Enums"]["visibility_type"]
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          start_date: string
          title: string
          type: Database["public"]["Enums"]["period_type"]
          updated_at?: string | null
          user_id: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          start_date?: string
          title?: string
          type?: Database["public"]["Enums"]["period_type"]
          updated_at?: string | null
          user_id?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          biography: string | null
          created_at: string | null
          date_of_birth: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          biography?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          biography?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      user_list_members: {
        Row: {
          list_id: string
          member_id: string
        }
        Insert: {
          list_id: string
          member_id: string
        }
        Update: {
          list_id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_list_members_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "user_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_list_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_visible_memories: {
        Args: { profile_id_param: string }
        Returns: number
      }
      get_profile_by_username: {
        Args: { username_text: string }
        Returns: {
          avatar_url: string | null
          biography: string | null
          created_at: string | null
          date_of_birth: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_visible_memories: {
        Args: {
          end_date_filter?: string
          profile_id_param: string
          start_date_filter?: string
        }
        Returns: {
          category: Database["public"]["Enums"]["memory_category"]
          created_at: string | null
          date: string
          date_precision: Database["public"]["Enums"]["date_precision"]
          description: string | null
          id: string
          location: string | null
          media_urls: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          visibility: Database["public"]["Enums"]["visibility_type"]
        }[]
        SetofOptions: {
          from: "*"
          to: "memories"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_visible_periods: {
        Args: { profile_id_param: string }
        Returns: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          start_date: string
          title: string
          type: Database["public"]["Enums"]["period_type"]
          updated_at: string | null
          user_id: string
          visibility: Database["public"]["Enums"]["visibility_type"]
        }[]
        SetofOptions: {
          from: "*"
          to: "periods"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      tag_people_in_memory: {
        Args: {
          p_memory_id: string
          tags: Database["public"]["CompositeTypes"]["tag_input"][]
        }
        Returns: undefined
      }
    }
    Enums: {
      date_precision: "today" | "complete" | "month_year" | "year_only"
      friendship_status: "pending" | "accepted" | "blocked"
      memory_category:
        | "travel"
        | "education"
        | "family"
        | "work"
        | "personal"
        | "milestone"
        | "other"
      period_type:
        | "residence"
        | "work"
        | "education"
        | "relationship"
        | "travel"
        | "project"
        | "other"
      visibility_type: "private" | "friends" | "lists" | "public"
    }
    CompositeTypes: {
      tag_input: {
        id: string | null
        type: string | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      date_precision: ["today", "complete", "month_year", "year_only"],
      friendship_status: ["pending", "accepted", "blocked"],
      memory_category: [
        "travel",
        "education",
        "family",
        "work",
        "personal",
        "milestone",
        "other",
      ],
      period_type: [
        "residence",
        "work",
        "education",
        "relationship",
        "travel",
        "project",
        "other",
      ],
      visibility_type: ["private", "friends", "lists", "public"],
    },
  },
} as const
