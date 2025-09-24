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

  // Fetch user profile and roles
  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError)
      } else if (profileData) {
        setProfile(profileData)
      }

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (rolesError) {
        console.error('Error fetching roles:', rolesError)
      } else if (rolesData) {
        setRoles(rolesData)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        
        if (session?.user) {
          setUser(session.user as AuthUser)
          // Fetch additional user data after auth state changes
          setTimeout(() => {
            fetchUserData(session.user.id)
          }, 0)
        } else {
          setUser(null)
          setProfile(null)
          setRoles([])
        }
        
        setLoading(false)
      }
    )

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        setUser(session.user as AuthUser)
        fetchUserData(session.user.id)
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
