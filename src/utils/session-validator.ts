/**
 * Session Validation Utilities
 * Ensures session stability and handles token refresh failures
 */

import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

/**
 * Validates the current session and refreshes if needed
 * @returns Valid session or null if validation fails
 */
export const validateSession = async (): Promise<Session | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Session validation failed:', error.message);
      return null;
    }
    
    if (!session) {
      console.warn('⚠️ No active session found');
      return null;
    }
    
    // Check if session is about to expire (within 5 minutes)
    const expiresAt = session.expires_at;
    if (expiresAt) {
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;
      
      if (timeUntilExpiry < 300) { // Less than 5 minutes
        console.info('🔄 Session expiring soon, refreshing...');
        const { data: { session: refreshedSession }, error: refreshError } = 
          await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('❌ Token refresh failed:', refreshError.message);
          return null;
        }
        
        console.info('✅ Session refreshed successfully');
        return refreshedSession;
      }
    }
    
    return session;
  } catch (error) {
    console.error('❌ Session validation error:', error);
    return null;
  }
};

/**
 * Forces session refresh
 * @returns Refreshed session or null
 */
export const forceRefreshSession = async (): Promise<Session | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('❌ Force refresh failed:', error.message);
      return null;
    }
    
    console.info('✅ Session force-refreshed');
    return session;
  } catch (error) {
    console.error('❌ Force refresh error:', error);
    return null;
  }
};

/**
 * Handles token refresh failure with retry logic
 * @param maxRetries Maximum number of retry attempts
 * @returns Valid session or null after all retries fail
 */
export const handleTokenRefreshFailure = async (
  maxRetries: number = 3
): Promise<Session | null> => {
  let retries = 0;
  
  while (retries < maxRetries) {
    console.warn(`🔄 Token refresh retry ${retries + 1}/${maxRetries}`);
    
    // Wait before retry (exponential backoff)
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
    
    const session = await forceRefreshSession();
    if (session) {
      console.info('✅ Token refresh successful on retry');
      return session;
    }
    
    retries++;
  }
  
  console.error('❌ All token refresh retries failed');
  return null;
};

/**
 * Checks if session is valid and not expired
 * @param session Session to check
 * @returns True if session is valid
 */
export const isSessionValid = (session: Session | null): boolean => {
  if (!session) return false;
  
  const expiresAt = session.expires_at;
  if (!expiresAt) return true; // If no expiry, assume valid
  
  const now = Math.floor(Date.now() / 1000);
  return expiresAt > now;
};
