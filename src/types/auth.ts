import type { User } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

export type UserProfile = {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  department: string | null
  position: string | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

export type UserRole = {
  id: string
  user_id: string | null
  role: Database['public']['Enums']['app_role']
  assigned_by: string | null
  assigned_at: string | null
  is_active: boolean | null
}

export type AuthUser = User & {
  profile?: UserProfile
  roles?: UserRole[]
}
