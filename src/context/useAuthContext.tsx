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
  const [initialized, setInitialized] = useState(false)

  // ✅ Phase 1: Timeout protection for fetchUserData (8 seconds max)
  const fetchWithTimeout = <T,>(promise: Promise<T>, timeout: number = 8000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ])
  }

  // ✅ PRIORITY 2: Enhanced session stability with retry logic + timeout protection
  const fetchUserData = async (userId: string, retries: number = 3): Promise<boolean> => {
    try {
      // Wrap the entire fetch operation in a timeout
      return await fetchWithTimeout(
        (async () => {
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
        })(),
        8000
      )
    } catch (error) {
      if (error instanceof Error && error.message === 'Timeout') {
        console.error('⏱️ [AUTH] fetchUserData timeout after 8 seconds')
        return false
      }
      
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

  // ✅ Phase 1: Single initialization with race-free loading and 10s timeout guarantee
  useEffect(() => {
    console.info('🔐 [AUTH] Initializing authentication context')
    
    let loadingTimeoutId: NodeJS.Timeout | null = null
    
    // ✅ Phase 1: Guarantee loading completes within 10 seconds maximum
    loadingTimeoutId = setTimeout(() => {
      if (loading && !initialized) {
        console.error('⏱️ [AUTH] Force-stopping loading after 10 seconds')
        setLoading(false)
        setInitialized(true)
      }
    }, 10000)
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.info(`🔐 [AUTH] State changed: ${event}`)
        
        setSession(session)
        
        if (session?.user) {
          console.info('🔐 [AUTH] Session active, fetching user data')
          setUser(session.user as AuthUser)
          
          const success = await fetchUserData(session.user.id)
          if (!success) {
            console.error('❌ [AUTH] Failed to fetch user data after retries')
          } else {
            console.info('✅ [AUTH] User data loaded successfully')
          }
        } else {
          console.info('🔐 [AUTH] No session, clearing user data')
          setUser(null)
          setProfile(null)
          setRoles([])
        }
        
        // ✅ v0.15.2: Handle explicit logout event
        if (event === 'SIGNED_OUT') {
          console.info('👋 [AUTH] User signed out, redirecting to sign-in')
          navigate('/auth/sign-in', { replace: true })
        }
        
        // ✅ Phase 1: Only set loading false once, after auth state is handled
        if (!initialized) {
          setLoading(false)
          setInitialized(true)
          if (loadingTimeoutId) clearTimeout(loadingTimeoutId)
        }
      }
    )

    // ✅ Phase 1: Combined initialization - check session only once on mount
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('❌ [AUTH] Session retrieval error:', error)
        if (!initialized) {
          setLoading(false)
          setInitialized(true)
          if (loadingTimeoutId) clearTimeout(loadingTimeoutId)
        }
        return
      }
      
      console.info('🔐 [AUTH] Initial session check:', session ? 'Session found' : 'No session')
      
      // Only process if subscription hasn't already handled it
      if (!initialized) {
        setSession(session)
        
        if (session?.user) {
          setUser(session.user as AuthUser)
          const success = await fetchUserData(session.user.id)
          if (!success) {
            console.error('❌ [AUTH] Failed to fetch user data on initialization')
          } else {
            console.info('✅ [AUTH] Initial user data loaded')
          }
        }
        
        setLoading(false)
        setInitialized(true)
        if (loadingTimeoutId) clearTimeout(loadingTimeoutId)
      }
    })

    return () => {
      subscription.unsubscribe()
      if (loadingTimeoutId) clearTimeout(loadingTimeoutId)
    }
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
    
    // ✅ v0.15.2: Explicitly clear Supabase session from localStorage
    localStorage.removeItem('sb-shwfzxpypygdxoqxutae-auth-token')
    
    // Let Supabase handle the signout and trigger SIGNED_OUT event
    await supabase.auth.signOut()
    
    // Note: State clearing and navigation handled by onAuthStateChange listener
    setLoading(false)
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
