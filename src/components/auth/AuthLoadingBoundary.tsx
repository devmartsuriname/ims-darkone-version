import { useEffect, useState } from 'react'
import { useAuthContext } from '@/context/useAuthContext'
import Preloader from '@/components/Preloader'

interface AuthLoadingBoundaryProps {
  children: React.ReactNode
}

/**
 * ✅ Phase 5: Unified Error Boundary with Recovery
 * 
 * Catches persistent loading states and provides recovery UI.
 * If loading exceeds 12 seconds, shows a recovery button to reload the app.
 */
export const AuthLoadingBoundary = ({ children }: AuthLoadingBoundaryProps) => {
  const { loading } = useAuthContext()
  const [forceRender, setForceRender] = useState(false)
  const [showRecovery, setShowRecovery] = useState(false)

  useEffect(() => {
    if (loading) {
      console.info('⏳ [AUTH-BOUNDARY] Loading detected, starting 12s timeout')
      
      const timeout = setTimeout(() => {
        console.error('❌ [AUTH-BOUNDARY] Force-stopping loading after 12 seconds')
        setForceRender(true)
        setShowRecovery(true)
      }, 12000)
      
      return () => {
        clearTimeout(timeout)
      }
    } else {
      // Reset recovery state when loading completes normally
      setForceRender(false)
      setShowRecovery(false)
    }
  }, [loading])

  // Show preloader while loading (and not force-rendered)
  if (loading && !forceRender) {
    return <Preloader />
  }

  // Show recovery UI if timeout was triggered
  if (showRecovery) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow">
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <div className="avatar-lg mx-auto mb-3">
                      <div className="avatar-title bg-warning-subtle text-warning rounded-circle">
                        <i className="bx bx-error-circle" style={{ fontSize: '3rem' }}></i>
                      </div>
                    </div>
                    <h4 className="text-warning">Loading Timeout</h4>
                  </div>
                  
                  <div className="alert alert-warning mb-4" role="alert">
                    <p className="mb-2">
                      <strong>The authentication check is taking longer than expected.</strong>
                    </p>
                    <p className="mb-0 small">
                      This may be due to slow network conditions or a temporary service issue.
                    </p>
                  </div>

                  <div className="mb-3">
                    <p className="text-muted small mb-2">You can try to:</p>
                    <ul className="text-muted small mb-0">
                      <li>Reload the application</li>
                      <li>Check your internet connection</li>
                      <li>Clear your browser cache</li>
                    </ul>
                  </div>

                  <button 
                    className="btn btn-primary w-100"
                    onClick={() => {
                      console.info('🔄 [AUTH-BOUNDARY] User triggered reload')
                      window.location.reload()
                    }}
                  >
                    <i className="bx bx-refresh me-1"></i>
                    Reload Application
                  </button>

                  <button 
                    className="btn btn-outline-secondary w-100 mt-2"
                    onClick={() => {
                      console.info('⏭️ [AUTH-BOUNDARY] User forced skip')
                      setShowRecovery(false)
                      setForceRender(false)
                    }}
                  >
                    Continue Anyway
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
