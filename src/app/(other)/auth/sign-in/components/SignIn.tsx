import DarkLogo from '@/assets/images/logo-dark.png'
import LightLogo from '@/assets/images/logo-light.png'
import TextFormInput from '@/components/from/TextFormInput'
import { useEffect } from 'react'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import useSignIn from '../useSignIn'
import { EnhancedButton } from '@/components/ui/EnhancedButtons'

const SignIn = () => {
  useEffect(() => {
    document.body.classList.add('authentication-bg')
    return () => {
      document.body.classList.remove('authentication-bg')
    }
  }, [])

  const { loading, login, control } = useSignIn()

  return (
    <div className="min-vh-100 d-flex align-items-center authentication-bg">
      <div className="container">
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Card className="border-0 shadow-large animate__animated animate__fadeInUp">
              <CardBody className="p-5">
                <div className="text-center mb-4">
                  <div className="auth-logo mb-4">
                    <Link to="/dashboards" className="logo-dark">
                      <img src={DarkLogo} height={40} alt="IMS Logo" className="animate__animated animate__pulse" />
                    </Link>
                    <Link to="/dashboards" className="logo-light">
                      <img src={LightLogo} height={36} alt="IMS Logo" className="animate__animated animate__pulse" />
                    </Link>
                  </div>
                  <h3 className="fw-bold mb-2">Welcome Back!</h3>
                  <p className="text-muted mb-0">
                    Sign in to access the Internal Management System
                  </p>
                </div>
                  <form onSubmit={login} className="mt-4">
                    <div className="mb-3">
                      <TextFormInput 
                        control={control} 
                        name="email" 
                        placeholder="Enter your email address" 
                        className="form-control" 
                        label="Email Address" 
                        type="email"
                      />
                    </div>
                    <div className="mb-3">
                      <Link to="/auth/reset-password" className="float-end text-muted ms-1">
                        Forgot password?
                      </Link>
                      <TextFormInput 
                        control={control} 
                        name="password" 
                        placeholder="Enter your password" 
                        className="form-control" 
                        label="Password" 
                        type="password"
                      />
                    </div>

                    <div className="form-check mb-3">
                      <input type="checkbox" className="form-check-input" id="remember-me" />
                      <label className="form-check-label" htmlFor="remember-me">
                        Remember me
                      </label>
                    </div>
                    <div className="d-grid">
                      <EnhancedButton
                        variant="gradient"
                        size="lg"
                        type="submit"
                        loading={loading}
                        loadingText="Signing In..."
                        icon="bi bi-box-arrow-in-right"
                        fullWidth
                        elevated
                        disabled={loading}
                      >
                        Sign In
                      </EnhancedButton>
                    </div>
                  </form>
                </CardBody>
              </Card>
              <div className="text-center mt-4">
                <p className="text-white-50 mb-0">
                  Don&apos;t have an account?{' '}
                  <Link 
                    to="/auth/sign-up" 
                    className="text-white fw-bold text-decoration-none"
                    style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}
                  >
                    Sign Up
                  </Link>
                 </p>
               </div>
             </Col>
           </Row>
         </div>
       </div>
  )
}

export default SignIn
