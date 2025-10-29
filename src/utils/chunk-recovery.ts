import { basePath } from '@/context/constants'

/**
 * Chunk Recovery Utility
 * 
 * Handles dynamic import failures and chunk load errors that can occur
 * when cached JavaScript chunks become stale after deployments.
 * 
 * Common scenarios:
 * - User has old cached chunks from previous deployment
 * - Live preview URL changes cause chunk mismatches
 * - Network interruptions during chunk loading
 */

function isChunkLoadError(err: any): boolean {
  if (!err) return false
  
  const message = (err?.message || err?.toString() || '').toLowerCase()
  
  // Check for common chunk load error patterns
  return (
    message.includes('chunk') ||
    message.includes('loading css chunk') ||
    message.includes('loading chunk') ||
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('dynamic import')
  )
}

export function installChunkRecovery() {
  console.info('🛡️ [CHUNK-RECOVERY] Installing chunk load error recovery')

  // Handle synchronous script loading errors
  window.addEventListener('error', (event) => {
    if (isChunkLoadError(event?.error)) {
      console.warn('⚠️ [CHUNK-RECOVERY] Chunk load error detected. Recovering...', {
        message: event.error?.message,
        filename: event.filename
      })
      
      // Redirect to base path to clear stale state
      const targetUrl = basePath || '/'
      console.info('🔄 [CHUNK-RECOVERY] Redirecting to:', targetUrl)
      window.location.href = targetUrl
    }
  })

  // Handle unhandled promise rejections (async dynamic imports)
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    if (isChunkLoadError(event?.reason)) {
      console.warn('⚠️ [CHUNK-RECOVERY] Unhandled promise rejection due to chunk load error. Recovering...', {
        reason: event.reason?.message || event.reason
      })
      
      // Prevent default error handling
      event.preventDefault()
      
      // Redirect to base path to clear stale state
      const targetUrl = basePath || '/'
      console.info('🔄 [CHUNK-RECOVERY] Redirecting to:', targetUrl)
      window.location.href = targetUrl
    }
  })

  console.info('✅ [CHUNK-RECOVERY] Chunk recovery system active')
}
