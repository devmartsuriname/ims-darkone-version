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
      applicants: {
        Row: {
          address: string | null
          children_count: number | null
          created_at: string | null
          date_of_birth: string | null
          district: string | null
          email: string | null
          employer_name: string | null
          employment_status: string | null
          first_name: string
          household_size: number | null
          id: string
          last_name: string
          marital_status: string | null
          monthly_income: number | null
          national_id: string
          nationality: string | null
          phone: string | null
          spouse_income: number | null
          spouse_name: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          children_count?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          district?: string | null
          email?: string | null
          employer_name?: string | null
          employment_status?: string | null
          first_name: string
          household_size?: number | null
          id?: string
          last_name: string
          marital_status?: string | null
          monthly_income?: number | null
          national_id: string
          nationality?: string | null
          phone?: string | null
          spouse_income?: number | null
          spouse_name?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          children_count?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          district?: string | null
          email?: string | null
          employer_name?: string | null
          employment_status?: string | null
          first_name?: string
          household_size?: number | null
          id?: string
          last_name?: string
          marital_status?: string | null
          monthly_income?: number | null
          national_id?: string
          nationality?: string | null
          phone?: string | null
          spouse_income?: number | null
          spouse_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      application_steps: {
        Row: {
          application_id: string | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          sla_hours: number | null
          started_at: string | null
          status: string | null
          step_name: Database["public"]["Enums"]["application_state"]
        }
        Insert: {
          application_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          sla_hours?: number | null
          started_at?: string | null
          status?: string | null
          step_name: Database["public"]["Enums"]["application_state"]
        }
        Update: {
          application_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          sla_hours?: number | null
          started_at?: string | null
          status?: string | null
          step_name?: Database["public"]["Enums"]["application_state"]
        }
        Relationships: [
          {
            foreignKeyName: "application_steps_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_steps_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applicant_id: string | null
          application_number: string
          approved_amount: number | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          current_state: Database["public"]["Enums"]["application_state"] | null
          id: string
          ownership_status: string | null
          priority_level: number | null
          property_address: string | null
          property_district: string | null
          property_surface_area: number | null
          property_type: Database["public"]["Enums"]["property_type"] | null
          reason_for_request: string | null
          requested_amount: number | null
          service_type: string | null
          sla_deadline: string | null
          special_circumstances: string | null
          submitted_at: string | null
          title_type: string | null
          updated_at: string | null
        }
        Insert: {
          applicant_id?: string | null
          application_number: string
          approved_amount?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_state?:
            | Database["public"]["Enums"]["application_state"]
            | null
          id?: string
          ownership_status?: string | null
          priority_level?: number | null
          property_address?: string | null
          property_district?: string | null
          property_surface_area?: number | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          reason_for_request?: string | null
          requested_amount?: number | null
          service_type?: string | null
          sla_deadline?: string | null
          special_circumstances?: string | null
          submitted_at?: string | null
          title_type?: string | null
          updated_at?: string | null
        }
        Update: {
          applicant_id?: string | null
          application_number?: string
          approved_amount?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_state?:
            | Database["public"]["Enums"]["application_state"]
            | null
          id?: string
          ownership_status?: string | null
          priority_level?: number | null
          property_address?: string | null
          property_district?: string | null
          property_surface_area?: number | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          reason_for_request?: string | null
          requested_amount?: number | null
          service_type?: string | null
          sla_deadline?: string | null
          special_circumstances?: string | null
          submitted_at?: string | null
          title_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "applicants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          checksum: string | null
          entity_id: string
          entity_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_active: boolean | null
          mime_type: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          checksum?: string | null
          entity_id: string
          entity_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          checksum?: string | null
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          operation: string
          record_id: string
          session_id: string | null
          table_name: string
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          record_id: string
          session_id?: string | null
          table_name: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          record_id?: string
          session_id?: string | null
          table_name?: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      control_photos: {
        Row: {
          application_id: string | null
          control_visit_id: string | null
          created_at: string | null
          file_path: string
          file_size: number | null
          gps_latitude: number | null
          gps_longitude: number | null
          id: string
          photo_category: string
          photo_description: string | null
          photo_hash: string | null
          taken_at: string | null
          taken_by: string | null
        }
        Insert: {
          application_id?: string | null
          control_visit_id?: string | null
          created_at?: string | null
          file_path: string
          file_size?: number | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          photo_category: string
          photo_description?: string | null
          photo_hash?: string | null
          taken_at?: string | null
          taken_by?: string | null
        }
        Update: {
          application_id?: string | null
          control_visit_id?: string | null
          created_at?: string | null
          file_path?: string
          file_size?: number | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          photo_category?: string
          photo_description?: string | null
          photo_hash?: string | null
          taken_at?: string | null
          taken_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "control_photos_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "control_photos_control_visit_id_fkey"
            columns: ["control_visit_id"]
            isOneToOne: false
            referencedRelation: "control_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "control_photos_taken_by_fkey"
            columns: ["taken_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      control_visits: {
        Row: {
          access_granted: boolean | null
          actual_date: string | null
          application_id: string | null
          assigned_inspector: string | null
          created_at: string | null
          id: string
          location_notes: string | null
          scheduled_date: string | null
          updated_at: string | null
          visit_status: string | null
          visit_type: string | null
          weather_conditions: string | null
        }
        Insert: {
          access_granted?: boolean | null
          actual_date?: string | null
          application_id?: string | null
          assigned_inspector?: string | null
          created_at?: string | null
          id?: string
          location_notes?: string | null
          scheduled_date?: string | null
          updated_at?: string | null
          visit_status?: string | null
          visit_type?: string | null
          weather_conditions?: string | null
        }
        Update: {
          access_granted?: boolean | null
          actual_date?: string | null
          application_id?: string | null
          assigned_inspector?: string | null
          created_at?: string | null
          id?: string
          location_notes?: string | null
          scheduled_date?: string | null
          updated_at?: string | null
          visit_status?: string | null
          visit_type?: string | null
          weather_conditions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "control_visits_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "control_visits_assigned_inspector_fkey"
            columns: ["assigned_inspector"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          application_id: string | null
          created_at: string | null
          display_order: number | null
          document_name: string
          document_type: string
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          is_required: boolean | null
          upload_date: string | null
          uploaded_by: string | null
          verification_notes: string | null
          verification_status:
            | Database["public"]["Enums"]["document_status"]
            | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          display_order?: number | null
          document_name: string
          document_type: string
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_required?: boolean | null
          upload_date?: string | null
          uploaded_by?: string | null
          verification_notes?: string | null
          verification_status?:
            | Database["public"]["Enums"]["document_status"]
            | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          display_order?: number | null
          document_name?: string
          document_type?: string
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_required?: boolean | null
          upload_date?: string | null
          uploaded_by?: string | null
          verification_notes?: string | null
          verification_status?:
            | Database["public"]["Enums"]["document_status"]
            | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      income_records: {
        Row: {
          amount: number
          applicant_id: string | null
          application_id: string | null
          created_at: string | null
          employer_name: string | null
          frequency: string | null
          id: string
          income_period_end: string | null
          income_period_start: string | null
          income_type: string
          position: string | null
          verification_document: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          applicant_id?: string | null
          application_id?: string | null
          created_at?: string | null
          employer_name?: string | null
          frequency?: string | null
          id?: string
          income_period_end?: string | null
          income_period_start?: string | null
          income_type: string
          position?: string | null
          verification_document?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          applicant_id?: string | null
          application_id?: string | null
          created_at?: string | null
          employer_name?: string | null
          frequency?: string | null
          id?: string
          income_period_end?: string | null
          income_period_start?: string | null
          income_type?: string
          position?: string | null
          verification_document?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "income_records_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "applicants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_records_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_records_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      outbox_events: {
        Row: {
          aggregate_id: string
          created_at: string | null
          error_message: string | null
          event_data: Json
          event_type: string
          id: string
          processed_at: string | null
          retry_count: number | null
        }
        Insert: {
          aggregate_id: string
          created_at?: string | null
          error_message?: string | null
          event_data: Json
          event_type: string
          id?: string
          processed_at?: string | null
          retry_count?: number | null
        }
        Update: {
          aggregate_id?: string
          created_at?: string | null
          error_message?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          processed_at?: string | null
          retry_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          email: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          phone: string | null
          position: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reference_data: {
        Row: {
          category: string
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name_en: string | null
          name_nl: string
          parent_code: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name_en?: string | null
          name_nl: string
          parent_code?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name_en?: string | null
          name_nl?: string
          parent_code?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      social_reports: {
        Row: {
          application_id: string | null
          approved_at: string | null
          approved_by: string | null
          community_integration: string | null
          created_at: string | null
          health_conditions: string | null
          household_situation: string | null
          id: string
          income_verification: string | null
          living_conditions_assessment: string | null
          recommendations: string | null
          social_conclusion: string | null
          social_priority_level: number | null
          social_worker_id: string | null
          special_needs: string | null
          submitted_at: string | null
          support_network: string | null
          vulnerability_score: number | null
        }
        Insert: {
          application_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          community_integration?: string | null
          created_at?: string | null
          health_conditions?: string | null
          household_situation?: string | null
          id?: string
          income_verification?: string | null
          living_conditions_assessment?: string | null
          recommendations?: string | null
          social_conclusion?: string | null
          social_priority_level?: number | null
          social_worker_id?: string | null
          special_needs?: string | null
          submitted_at?: string | null
          support_network?: string | null
          vulnerability_score?: number | null
        }
        Update: {
          application_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          community_integration?: string | null
          created_at?: string | null
          health_conditions?: string | null
          household_situation?: string | null
          id?: string
          income_verification?: string | null
          living_conditions_assessment?: string | null
          recommendations?: string | null
          social_conclusion?: string | null
          social_priority_level?: number | null
          social_worker_id?: string | null
          special_needs?: string | null
          submitted_at?: string | null
          support_network?: string | null
          vulnerability_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_reports_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_reports_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_reports_social_worker_id_fkey"
            columns: ["social_worker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          application_id: string | null
          assigned_by: string | null
          assigned_to: string | null
          auto_generated: boolean | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: number | null
          sla_hours: number | null
          status: Database["public"]["Enums"]["task_status"] | null
          task_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          auto_generated?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: number | null
          sla_hours?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          auto_generated?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: number | null
          sla_hours?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      technical_reports: {
        Row: {
          application_id: string | null
          approved_at: string | null
          approved_by: string | null
          control_visit_id: string | null
          created_at: string | null
          electrical_condition: string | null
          estimated_cost: number | null
          floor_condition: string | null
          foundation_condition: string | null
          id: string
          inspector_id: string | null
          recommendations: string | null
          recommended_repairs: string | null
          roof_condition: string | null
          sanitation_condition: string | null
          sewerage_condition: string | null
          structural_issues: string | null
          submitted_at: string | null
          technical_conclusion: string | null
          urgency_level: number | null
          walls_condition: string | null
          water_supply_condition: string | null
          windows_doors_condition: string | null
        }
        Insert: {
          application_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          control_visit_id?: string | null
          created_at?: string | null
          electrical_condition?: string | null
          estimated_cost?: number | null
          floor_condition?: string | null
          foundation_condition?: string | null
          id?: string
          inspector_id?: string | null
          recommendations?: string | null
          recommended_repairs?: string | null
          roof_condition?: string | null
          sanitation_condition?: string | null
          sewerage_condition?: string | null
          structural_issues?: string | null
          submitted_at?: string | null
          technical_conclusion?: string | null
          urgency_level?: number | null
          walls_condition?: string | null
          water_supply_condition?: string | null
          windows_doors_condition?: string | null
        }
        Update: {
          application_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          control_visit_id?: string | null
          created_at?: string | null
          electrical_condition?: string | null
          estimated_cost?: number | null
          floor_condition?: string | null
          foundation_condition?: string | null
          id?: string
          inspector_id?: string | null
          recommendations?: string | null
          recommended_repairs?: string | null
          roof_condition?: string | null
          sanitation_condition?: string | null
          sewerage_condition?: string | null
          structural_issues?: string | null
          submitted_at?: string | null
          technical_conclusion?: string | null
          urgency_level?: number | null
          walls_condition?: string | null
          water_supply_condition?: string | null
          windows_doors_condition?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technical_reports_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technical_reports_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technical_reports_control_visit_id_fkey"
            columns: ["control_visit_id"]
            isOneToOne: false
            referencedRelation: "control_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technical_reports_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_control_inspect: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_manage_applications: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_review_applications: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_admin_or_it: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "it"
        | "staff"
        | "control"
        | "director"
        | "minister"
        | "front_office"
        | "applicant"
      application_state:
        | "DRAFT"
        | "INTAKE_REVIEW"
        | "CONTROL_ASSIGN"
        | "CONTROL_VISIT_SCHEDULED"
        | "CONTROL_IN_PROGRESS"
        | "TECHNICAL_REVIEW"
        | "SOCIAL_REVIEW"
        | "DIRECTOR_REVIEW"
        | "MINISTER_DECISION"
        | "CLOSURE"
        | "REJECTED"
        | "ON_HOLD"
      document_status: "PENDING" | "VERIFIED" | "REJECTED" | "MISSING"
      property_type:
        | "RESIDENTIAL"
        | "COMMERCIAL"
        | "INDUSTRIAL"
        | "AGRICULTURAL"
        | "OTHER"
      task_status:
        | "PENDING"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "OVERDUE"
        | "CANCELLED"
    }
    CompositeTypes: {
      [_ in never]: never
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
      app_role: [
        "admin",
        "it",
        "staff",
        "control",
        "director",
        "minister",
        "front_office",
        "applicant",
      ],
      application_state: [
        "DRAFT",
        "INTAKE_REVIEW",
        "CONTROL_ASSIGN",
        "CONTROL_VISIT_SCHEDULED",
        "CONTROL_IN_PROGRESS",
        "TECHNICAL_REVIEW",
        "SOCIAL_REVIEW",
        "DIRECTOR_REVIEW",
        "MINISTER_DECISION",
        "CLOSURE",
        "REJECTED",
        "ON_HOLD",
      ],
      document_status: ["PENDING", "VERIFIED", "REJECTED", "MISSING"],
      property_type: [
        "RESIDENTIAL",
        "COMMERCIAL",
        "INDUSTRIAL",
        "AGRICULTURAL",
        "OTHER",
      ],
      task_status: [
        "PENDING",
        "IN_PROGRESS",
        "COMPLETED",
        "OVERDUE",
        "CANCELLED",
      ],
    },
  },
} as const
