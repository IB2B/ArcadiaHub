// Placeholder - Will be generated from Supabase schema
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: string
          company_name: string | null
          logo_url: string | null
          contact_first_name: string | null
          contact_last_name: string | null
          phone: string | null
          address: string | null
          city: string | null
          region: string | null
          country: string | null
          postal_code: string | null
          category: string | null
          website: string | null
          description: string | null
          social_links: Json | null
          tags: string[] | null
          is_active: boolean | null
          notification_preferences: Json | null
          assigned_commercial_id: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          role?: string
          company_name?: string | null
          logo_url?: string | null
          contact_first_name?: string | null
          contact_last_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          region?: string | null
          country?: string | null
          postal_code?: string | null
          category?: string | null
          website?: string | null
          description?: string | null
          social_links?: Json | null
          tags?: string[] | null
          is_active?: boolean | null
          notification_preferences?: Json | null
          assigned_commercial_id?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          role?: string
          company_name?: string | null
          logo_url?: string | null
          contact_first_name?: string | null
          contact_last_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          region?: string | null
          country?: string | null
          postal_code?: string | null
          category?: string | null
          website?: string | null
          description?: string | null
          social_links?: Json | null
          tags?: string[] | null
          is_active?: boolean | null
          notification_preferences?: Json | null
          assigned_commercial_id?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cases: {
        Row: {
          id: string
          case_code: string
          partner_id: string
          client_name: string
          status: string | null
          notes: string | null
          opened_at: string | null
          closed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          case_code: string
          partner_id: string
          client_name: string
          status?: string | null
          notes?: string | null
          opened_at?: string | null
          closed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          case_code?: string
          partner_id?: string
          client_name?: string
          status?: string | null
          notes?: string | null
          opened_at?: string | null
          closed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_type: string
          start_datetime: string
          end_datetime: string | null
          location: string | null
          meeting_link: string | null
          recording_url: string | null
          attachments: Json | null
          created_by: string | null
          is_published: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_type: string
          start_datetime: string
          end_datetime?: string | null
          location?: string | null
          meeting_link?: string | null
          recording_url?: string | null
          attachments?: Json | null
          created_by?: string | null
          is_published?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_type?: string
          start_datetime?: string
          end_datetime?: string | null
          location?: string | null
          meeting_link?: string | null
          recording_url?: string | null
          attachments?: Json | null
          created_by?: string | null
          is_published?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      academy_content: {
        Row: {
          id: string
          title: string
          description: string | null
          content_type: string
          thumbnail_url: string | null
          media_url: string | null
          attachments: Json | null
          year: number | null
          theme: string | null
          duration_minutes: number | null
          is_downloadable: boolean | null
          is_published: boolean | null
          view_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content_type: string
          thumbnail_url?: string | null
          media_url?: string | null
          attachments?: Json | null
          year?: number | null
          theme?: string | null
          duration_minutes?: number | null
          is_downloadable?: boolean | null
          is_published?: boolean | null
          view_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content_type?: string
          thumbnail_url?: string | null
          media_url?: string | null
          attachments?: Json | null
          year?: number | null
          theme?: string | null
          duration_minutes?: number | null
          is_downloadable?: boolean | null
          is_published?: boolean | null
          view_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          file_url: string
          file_type: string | null
          file_size: number | null
          folder_path: string | null
          is_published: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          file_url: string
          file_type?: string | null
          file_size?: number | null
          folder_path?: string | null
          is_published?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          file_url?: string
          file_type?: string | null
          file_size?: number | null
          folder_path?: string | null
          is_published?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          featured_image: string | null
          author_id: string | null
          category: string | null
          tags: string[] | null
          is_published: boolean | null
          published_at: string | null
          view_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          featured_image?: string | null
          author_id?: string | null
          category?: string | null
          tags?: string[] | null
          is_published?: boolean | null
          published_at?: string | null
          view_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          featured_image?: string | null
          author_id?: string | null
          category?: string | null
          tags?: string[] | null
          is_published?: boolean | null
          published_at?: string | null
          view_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string | null
          type: string | null
          link: string | null
          is_read: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message?: string | null
          type?: string | null
          link?: string | null
          is_read?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string | null
          type?: string | null
          link?: string | null
          is_read?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      case_documents: {
        Row: {
          id: string
          case_id: string
          title: string
          file_url: string
          file_type: string | null
          uploaded_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          case_id: string
          title: string
          file_url: string
          file_type?: string | null
          uploaded_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          case_id?: string
          title?: string
          file_url?: string
          file_type?: string | null
          uploaded_by?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      case_history: {
        Row: {
          id: string
          case_id: string
          old_status: string | null
          new_status: string
          changed_by: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          case_id: string
          old_status?: string | null
          new_status: string
          changed_by?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          case_id?: string
          old_status?: string | null
          new_status?: string
          changed_by?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          id: string
          event_id: string
          user_id: string
          attended: boolean | null
          registered_at: string | null
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          attended?: boolean | null
          registered_at?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          attended?: boolean | null
          registered_at?: string | null
        }
        Relationships: []
      }
      content_completions: {
        Row: {
          id: string
          content_id: string
          user_id: string
          progress_percent: number | null
          completed_at: string | null
          started_at: string | null
        }
        Insert: {
          id?: string
          content_id: string
          user_id: string
          progress_percent?: number | null
          completed_at?: string | null
          started_at?: string | null
        }
        Update: {
          id?: string
          content_id?: string
          user_id?: string
          progress_percent?: number | null
          completed_at?: string | null
          started_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      certifications: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      partner_services: {
        Row: {
          partner_id: string
          service_id: string
        }
        Insert: {
          partner_id: string
          service_id: string
        }
        Update: {
          partner_id?: string
          service_id?: string
        }
        Relationships: []
      }
      partner_certifications: {
        Row: {
          partner_id: string
          certification_id: string
          obtained_at: string | null
        }
        Insert: {
          partner_id: string
          certification_id: string
          obtained_at?: string | null
        }
        Update: {
          partner_id?: string
          certification_id?: string
          obtained_at?: string | null
        }
        Relationships: []
      }
      access_requests: {
        Row: {
          id: string
          status: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
          contact_first_name: string
          contact_last_name: string
          contact_phone: string
          contact_email: string
          contact_description: string
          contact_photo_url: string | null
          company_name: string
          legal_address: string
          operational_address: string
          business_phone: string
          generic_email: string
          pec: string
          company_description: string
          company_logo_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          status?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          contact_first_name: string
          contact_last_name: string
          contact_phone: string
          contact_email: string
          contact_description: string
          contact_photo_url?: string | null
          company_name: string
          legal_address: string
          operational_address: string
          business_phone: string
          generic_email: string
          pec: string
          company_description: string
          company_logo_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          status?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          contact_first_name?: string
          contact_last_name?: string
          contact_phone?: string
          contact_email?: string
          contact_description?: string
          contact_photo_url?: string | null
          company_name?: string
          legal_address?: string
          operational_address?: string
          business_phone?: string
          generic_email?: string
          pec?: string
          company_description?: string
          company_logo_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          id: string
          user_id: string
          subject: string
          message: string
          status: string | null
          admin_reply: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          message: string
          status?: string | null
          admin_reply?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          message?: string
          status?: string | null
          admin_reply?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          entity_type: string
          entity_id: string
          author_id: string
          content: string
          parent_id: string | null
          mentions: string[] | null
          is_edited: boolean | null
          edited_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id: string
          author_id: string
          content: string
          parent_id?: string | null
          mentions?: string[] | null
          is_edited?: boolean | null
          edited_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          entity_type?: string
          entity_id?: string
          author_id?: string
          content?: string
          parent_id?: string | null
          mentions?: string[] | null
          is_edited?: boolean | null
          edited_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier access
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
