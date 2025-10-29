/**
 * Cache Management System
 * Automatically clears browser cache when a new build is deployed
 * Preserves authentication tokens to prevent forced logout
 */

// Build version from environment - use static version, not timestamp
const BUILD_VERSION = import.meta.env.VITE_BUILD_VERSION || 'dev';
const STORAGE_KEY = 'app_build_version';
const AUTH_TOKEN_KEY = 'sb-shwfzxpypygdxoqxutae-auth-token';

export const checkAndClearCache = async (): Promise<void> => {
  try {
    const storedVersion = localStorage.getItem(STORAGE_KEY);
    
    // Only clear cache if version string actually changed (not on every load)
    // Skip cache clearing in dev mode to prevent constant reloads
    if (storedVersion && storedVersion !== BUILD_VERSION && BUILD_VERSION !== 'dev') {
      console.info(`🧹 New version deployed (${storedVersion} → ${BUILD_VERSION}), clearing cache...`);
      
      // Preserve auth tokens before clearing
      const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
      
      // Clear all browser caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.info('✅ Browser caches cleared');
      }
      
      // Clear localStorage except auth
      localStorage.clear();
      
      // Restore auth token
      if (authToken) {
        localStorage.setItem(AUTH_TOKEN_KEY, authToken);
      }
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Update to new version
      localStorage.setItem(STORAGE_KEY, BUILD_VERSION);
      
      console.info('✅ Cache cleanup complete, reloading...');
      
      // Reload page to apply changes
      window.location.reload();
    } else if (!storedVersion) {
      // First time - just set version
      localStorage.setItem(STORAGE_KEY, BUILD_VERSION);
      console.info(`🎯 Version initialized: ${BUILD_VERSION}`);
    } else {
      console.info(`✅ Version current: ${BUILD_VERSION} (no cache clear needed)`);
    }
  } catch (error) {
    console.error('❌ Cache cleanup failed:', error);
  }
};

/**
 * Manual cache clear (for debugging)
 */
export const forceClearCache = async (): Promise<void> => {
  console.warn('🔧 Manual cache clear initiated');
  
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }
  
  const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
  localStorage.clear();
  if (authToken) localStorage.setItem(AUTH_TOKEN_KEY, authToken);
  sessionStorage.clear();
  
  window.location.reload();
};

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).__forceClearCache = forceClearCache;
}
