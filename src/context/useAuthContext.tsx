import type { AuthUser, UserProfile, UserRole } from '@/types/auth'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ChildrenType } from '../types/component-props'

export type AuthContextType = {
  user: AuthUser | null
  session: Session | null
  profile: UserProfile | null
  roles: UserRole[]
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: { firstName: string; lastName: string }) => Promise<{ error: any }>
  signOut: () => Promise<void>
  hasRole: (role: string) => boolean
  canManageApplications: () => boolean
  canControlInspect: () => boolean
  canReviewApplications: () => boolean
  isAdminOrIT: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: ChildrenType) {
  const navigate = useNavigate()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ PRIORITY 2: Enhanced session stability with retry logic
  const fetchUserData = async (userId: string, retries: number = 3): Promise<boolean> => {
    try {
      // Fetch profile with retry logic
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.warn('⚠️ Profile not found for user:', userId)
        } else {
          console.error('❌ Error fetching profile:', profileError)
          
          // ✅ Retry on failure
          if (retries > 0) {
            console.warn(`🔄 Retrying profile fetch (${retries} attempts left)`)
            await new Promise(resolve => setTimeout(resolve, 1000))
            return fetchUserData(userId, retries - 1)
          }
          return false
        }
      } else if (profileData) {
        setProfile(profileData)
      }

      // Fetch roles with retry logic
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (rolesError) {
        console.error('❌ Error fetching roles:', rolesError)
        
        // ✅ Retry on failure
        if (retries > 0) {
          console.warn(`🔄 Retrying roles fetch (${retries} attempts left)`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          return fetchUserData(userId, retries - 1)
        }
        return false
      } else if (rolesData) {
        setRoles(rolesData)
      }
      
      return true
    } catch (error) {
      console.error('❌ Critical error fetching user data:', error)
      
      // ✅ Retry on exception
      if (retries > 0) {
        console.warn(`🔄 Retrying after exception (${retries} attempts left)`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return fetchUserData(userId, retries - 1)
      }
      return false
    }
  }

  // ✅ PRIORITY 2: Enhanced auth initialization with session validation
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.info(`🔐 Auth state changed: ${event}`)
        
        setSession(session)
        
        if (session?.user) {
          setUser(session.user as AuthUser)
          
          // ✅ Increased delay from 0ms to 100ms to prevent race conditions
          setTimeout(async () => {
            const success = await fetchUserData(session.user.id)
            if (!success) {
              console.error('❌ Failed to fetch user data after retries')
            }
          }, 100)
        } else {
          setUser(null)
          setProfile(null)
          setRoles([])
        }
        
        setLoading(false)
      }
    )

    // Check for existing session with validation
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Session retrieval error:', error)
        setLoading(false)
        return
      }
      
      setSession(session)
      
      if (session?.user) {
        setUser(session.user as AuthUser)
        const success = await fetchUserData(session.user.id)
        if (!success) {
          console.error('❌ Failed to fetch user data on initialization')
        }
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)
    return { error }
  }

  const signUp = async (email: string, password: string, userData: { firstName: string; lastName: string }) => {
    setLoading(true)
    const redirectUrl = `${window.location.origin}/`
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        }
      }
    })
    setLoading(false)
    return { error }
  }

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
    setRoles([])
    setLoading(false)
    navigate('/auth/sign-in')
  }

  // Role checking helper functions
  const hasRole = (role: string) => {
    return roles.some(r => r.role === role && r.is_active)
  }

  const canManageApplications = () => {
    return hasRole('admin') || hasRole('it') || hasRole('staff') || hasRole('front_office')
  }

  const canControlInspect = () => {
    return hasRole('admin') || hasRole('it') || hasRole('control')
  }

  const canReviewApplications = () => {
    return hasRole('admin') || hasRole('it') || hasRole('staff') || hasRole('director') || hasRole('minister')
  }

  const isAdminOrIT = () => {
    return hasRole('admin') || hasRole('it')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        loading,
        isAuthenticated: !!session,
        signIn,
        signUp,
        signOut,
        hasRole,
        canManageApplications,
        canControlInspect,
        canReviewApplications,
        isAdminOrIT,
      }}>
      {children}
    </AuthContext.Provider>
  )
}
