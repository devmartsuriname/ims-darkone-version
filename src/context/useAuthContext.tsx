import type { AuthUser, UserProfile, UserRole } from '@/types/auth'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ChildrenType } from '../types/component-props'
import { log } from '@/utils/log'

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
  const [userDataFetched, setUserDataFetched] = useState(false) // ✅ Phase 1: Deduplication guard

  // ✅ Phase 2: Timeout protection for fetchUserData (4 seconds max)
  const fetchWithTimeout = <T,>(promise: Promise<T>, timeout: number = 4000): Promise<T> => {
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
              
              // ✅ Phase 3: Retry on failure with exponential backoff
              if (retries > 0) {
                log.auth.warn(`Retrying profile fetch (${retries} attempts left)`)
                const retryDelay = Math.min(250 * Math.pow(2, 3 - retries), 2000)
                await new Promise(resolve => setTimeout(resolve, retryDelay))
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
            log.auth.error('Error fetching roles', rolesError)
            
            // ✅ Phase 3: Retry on failure with exponential backoff
            if (retries > 0) {
              log.auth.warn(`Retrying roles fetch (${retries} attempts left)`)
              const retryDelay = Math.min(250 * Math.pow(2, 3 - retries), 2000)
              await new Promise(resolve => setTimeout(resolve, retryDelay))
              return fetchUserData(userId, retries - 1)
            }
            return false
          } else if (rolesData) {
            setRoles(rolesData)
          }
          
          return true
        })(),
        4000 // ✅ Phase 2: Reduced from 8s to 4s
      )
    } catch (error) {
      if (error instanceof Error && error.message === 'Timeout') {
        log.auth.error('fetchUserData timeout after 4 seconds') // ✅ Phase 2: Updated message
        return false
      }
      
      log.auth.error('Critical error fetching user data', error)
      
      // ✅ Phase 3: Retry on exception with exponential backoff
      if (retries > 0) {
        console.warn(`🔄 Retrying after exception (${retries} attempts left)`)
        const retryDelay = Math.min(250 * Math.pow(2, 3 - retries), 2000)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        return fetchUserData(userId, retries - 1)
      }
      return false
    }
  }

  // ✅ Phase 4: Detect editor environment for fast-path loading
  const isEditorPreview = (() => {
    try {
      return (
        window.self !== window.top && // Must be in iframe
        (
          window.location.hostname.includes('lovableproject.com') ||
          window.location.hostname.includes('lovable.app') ||
          document.referrer.includes('lovable.dev')
        )
      )
    } catch (e) {
      // Cross-origin access blocked - assume we're in an embedded preview
      return window.self !== window.top
    }
  })()

  // ✅ Phase 1: Single initialization with race-free loading and 10s timeout guarantee
  useEffect(() => {
    log.auth.info('Initializing authentication context')
    
    let loadingTimeoutId: NodeJS.Timeout | null = null
    
    // ✅ Phase 1: Guarantee loading completes within 10 seconds maximum
    loadingTimeoutId = setTimeout(() => {
      if (loading && !initialized) {
        log.auth.error('Force-stopping loading after 10 seconds')
        setLoading(false)
        setInitialized(true)
      }
    }, 10000)
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        log.auth.info(`State changed: ${event}`)
        
        setSession(session)
        
        if (session?.user) {
          log.auth.info('Session active, fetching user data')
          setUser(session.user as AuthUser)
          
          // ✅ Phase 4: Editor bypass - use mock data for instant loading
          if (isEditorPreview) {
            log.auth.warn('Editor preview detected - using mock profile/roles')
            setProfile({ 
              id: session.user.id, 
              email: session.user.email ?? null,
              first_name: 'Preview',
              last_name: 'User',
              phone: null,
              department: null,
              position: null,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            setRoles([{ 
              id: 'mock-role-id',
              user_id: session.user.id, 
              role: 'admin' as any,
              assigned_by: null,
              assigned_at: new Date().toISOString(),
              is_active: true 
            }])
          } else {
            // ✅ Phase 1: Prevent duplicate fetchUserData calls
            if (!userDataFetched) {
              const success = await fetchUserData(session.user.id)
              if (!success) {
                log.auth.error('Failed to fetch user data after retries')
              } else {
                setUserDataFetched(true) // ✅ Phase 1: Mark as fetched
                log.auth.info('User data loaded successfully')
              }
            }
          }
        } else {
          log.auth.info('No session, clearing user data')
          setUser(null)
          setProfile(null)
          setRoles([])
        }
        
        // ✅ v0.15.2: Handle explicit logout event
        if (event === 'SIGNED_OUT') {
          log.auth.info('User signed out, redirecting to sign-in')
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
        log.auth.error('Session retrieval error', error)
        if (!initialized) {
          setLoading(false)
          setInitialized(true)
          if (loadingTimeoutId) clearTimeout(loadingTimeoutId)
        }
        return
      }
      
      log.auth.info(`Initial session check: ${session ? 'Session found' : 'No session'}`)
      
      // Only process if subscription hasn't already handled it
      if (!initialized) {
        setSession(session)
        
        if (session?.user) {
          setUser(session.user as AuthUser)
          
          // ✅ Phase 4: Editor bypass on initial session check
          if (isEditorPreview) {
            log.auth.warn('Editor preview (initial) - using mock profile/roles')
            setProfile({ 
              id: session.user.id, 
              email: session.user.email ?? null,
              first_name: 'Preview',
              last_name: 'User',
              phone: null,
              department: null,
              position: null,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            setRoles([{ 
              id: 'mock-role-id',
              user_id: session.user.id, 
              role: 'admin' as any,
              assigned_by: null,
              assigned_at: new Date().toISOString(),
              is_active: true 
            }])
          } else {
            // ✅ Phase 1: Prevent duplicate fetchUserData calls
            if (!userDataFetched) {
              const success = await fetchUserData(session.user.id)
              if (!success) {
                log.auth.error('Failed to fetch user data on initialization')
              } else {
                setUserDataFetched(true) // ✅ Phase 1: Mark as fetched
                log.auth.info('Initial user data loaded')
              }
            }
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
    
    // ✅ Phase 4: Reset deduplication guard for immediate re-login
    setUserDataFetched(false)
    
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
