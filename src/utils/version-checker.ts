/**
 * Version Checker Utility
 * Validates client-server version synchronization
 */

import { supabase } from '@/integrations/supabase/client';

export interface VersionCheckResult {
  clientVersion: string;
  serverVersion: string | null;
  isSync: boolean;
  timestamp: string;
}

/**
 * Check if client version matches server version
 */
export const checkServerVersion = async (): Promise<VersionCheckResult> => {
  const clientVersion = import.meta.env.VITE_BUILD_VERSION || 'dev';
  
  try {
    // Call health check edge function to get server version
    const { data, error } = await supabase.functions.invoke('health-check', {
      body: { action: 'version' }
    });
    
    if (error) {
      console.warn('⚠️ Version check failed:', error.message);
      return {
        clientVersion,
        serverVersion: null,
        isSync: true, // Assume sync if check fails
        timestamp: new Date().toISOString()
      };
    }
    
    const serverVersion = data?.version || null;
    const isSync = !serverVersion || clientVersion === serverVersion;
    
    if (!isSync) {
      console.warn(`⚠️ Version mismatch: Client=${clientVersion}, Server=${serverVersion}`);
    } else {
      console.info(`✅ Version sync confirmed: ${clientVersion}`);
    }
    
    return {
      clientVersion,
      serverVersion,
      isSync,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Version check error:', error);
    return {
      clientVersion,
      serverVersion: null,
      isSync: true,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Get current client version
 */
export const getClientVersion = (): string => {
  return import.meta.env.VITE_BUILD_VERSION || 'dev';
};

/**
 * Format version for display
 */
export const formatVersion = (version: string): string => {
  if (version === 'dev') return 'Development';
  return `v${version}`;
};
