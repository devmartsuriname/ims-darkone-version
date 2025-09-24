import { useEffect } from 'react'
import DarkLogo from '@/assets/images/logo-dark.png'
import LightLogo from '@/assets/images/logo-light.png'
import TextFormInput from '@/components/from/TextFormInput'
import PasswordFormInput from '@/components/from/PasswordFormInput'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import useSignUp from '../useSignUp'

const SignUp = () => {
  useEffect(() => {
    document.body.classList.add('authentication-bg')
    return () => {
      document.body.classList.remove('authentication-bg')
    }
  }, [])

  const { loading, register, control } = useSignUp()

  return (
    <>
      <div className="">
        <div className="account-pages py-5">
          <div className="container">
            <Row className="justify-content-center">
              <Col md={6} lg={5}>
                <Card className="border-0 shadow-lg">
                  <CardBody className="p-5">
                    <div className="text-center">
                      <div className="mx-auto mb-4 text-center auth-logo">
                        <Link to="/dashboard" className="logo-dark">
                          <img src={DarkLogo} height={32} alt="logo dark" />
                        </Link>
                        <Link to="/dashboard" className="logo-light">
                          <img src={LightLogo} height={28} alt="logo light" />
                        </Link>
                      </div>
                      <h4 className="fw-bold text-dark mb-2">Create Account</h4>
                      <p className="text-muted">Join our Internal Management System platform</p>
                    </div>
                    <form onSubmit={register} className="mt-4">
                      <Row>
                        <Col md={6}>
                          <div className="mb-3">
                            <TextFormInput 
                              control={control} 
                              name="firstName" 
                              placeholder="Enter your first name" 
                              className="form-control" 
                              label="First Name" 
                            />
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <TextFormInput 
                              control={control} 
                              name="lastName" 
                              placeholder="Enter your last name" 
                              className="form-control" 
                              label="Last Name" 
                            />
                          </div>
                        </Col>
                      </Row>
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
                        <PasswordFormInput
                          control={control}
                          name="password"
                          placeholder="Create a strong password"
                          className="form-control"
                          label="Password"
                        />
                        <small className="text-muted">
                          Password must be at least 8 characters with uppercase, lowercase, and numbers
                        </small>
                      </div>
                      <div className="mb-3">
                        <PasswordFormInput
                          control={control}
                          name="confirmPassword"
                          placeholder="Confirm your password"
                          className="form-control"
                          label="Confirm Password"
                        />
                      </div>
                      <div className="mb-3">
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="terms-checkbox" />
                          <label className="form-check-label" htmlFor="terms-checkbox">
                            I accept the <Link to="/terms" className="text-decoration-none">Terms and Conditions</Link> and <Link to="/privacy" className="text-decoration-none">Privacy Policy</Link>
                          </label>
                        </div>
                      </div>
                      <div className="mb-1 text-center d-grid">
                        <button 
                          disabled={loading} 
                          className="btn btn-dark btn-lg fw-medium" 
                          type="submit"
                        >
                          {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                      </div>
                    </form>
                  </CardBody>
                </Card>
                <p className="text-center mt-4 text-white text-opacity-50">
                  Already have an account?&nbsp;
                  <Link to="/auth/sign-in" className="text-decoration-none text-white fw-bold">
                    Sign In
                  </Link>
                </p>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignUp
