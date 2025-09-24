import React, { useState } from 'react';
import { useAuthenticationFlow } from '@/hooks/useAuthenticationFlow';
import { EnhancedButton } from '@/components/ui/EnhancedButtons';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LogoDark from '@/assets/images/logo-dark.png';
import LogoLight from '@/assets/images/logo-light.png';

const InitialSystemSetup: React.FC = () => {
  const { createInitialAdmin, completeInitialSetup } = useAuthenticationFlow();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [adminData, setAdminData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    department: 'Administration',
    position: 'System Administrator'
  });

  const handleInputChange = (field: string, value: string) => {
    setAdminData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateAdmin = async () => {
    setLoading(true);
    try {
      const result = await createInitialAdmin(adminData);
      
      if (result.success) {
        setStep(2);
        toast.success('Administrator account created successfully!');
      } else {
        toast.error(result.error || 'Failed to create administrator account');
      }
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    completeInitialSetup();
    navigate('/auth/sign-in');
  };

  const isFormValid = () => {
    return adminData.email && 
           adminData.password && 
           adminData.firstName && 
           adminData.lastName &&
           adminData.password.length >= 6;
  };

  return (
    <div className="authentication-bg min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="mx-auto mb-4 text-center auth-logo">
                    <img src={LogoDark} height={40} alt="IMS Logo" className="logo-dark" />
                    <img src={LogoLight} height={40} alt="IMS Logo" className="logo-light" />
                  </div>
                  <h3 className="fw-bold text-primary">Welcome to IMS</h3>
                  <p className="text-muted">Internal Management System - Initial Setup</p>
                </div>

                {step === 1 ? (
                  <div>
                    <div className="alert alert-info mb-4">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>First Time Setup:</strong> Create your administrator account to get started with the Internal Management System.
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">First Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={adminData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder="Enter first name"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Last Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={adminData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder="Enter last name"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={adminData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter administrator email"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        value={adminData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Create a secure password"
                        required
                      />
                      <small className="text-muted">Password must be at least 6 characters long</small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={adminData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter phone number (optional)"
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Department</label>
                          <input
                            type="text"
                            className="form-control"
                            value={adminData.department}
                            onChange={(e) => handleInputChange('department', e.target.value)}
                            placeholder="Department"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Position</label>
                          <input
                            type="text"
                            className="form-control"
                            value={adminData.position}
                            onChange={(e) => handleInputChange('position', e.target.value)}
                            placeholder="Job position"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="d-grid">
                      <EnhancedButton
                        variant="primary"
                        onClick={handleCreateAdmin}
                        loading={loading}
                        disabled={loading || !isFormValid()}
                        size="lg"
                      >
                        Create Administrator Account
                      </EnhancedButton>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mb-4">
                      <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                    </div>
                    <h4 className="text-success mb-3">Setup Complete!</h4>
                    <p className="mb-4">
                      Your administrator account has been created successfully. You can now sign in and start using the Internal Management System.
                    </p>
                    <div className="alert alert-success mb-4">
                      <strong>Administrator Email:</strong> {adminData.email}
                    </div>
                    <div className="d-grid">
                      <EnhancedButton
                        variant="success"
                        onClick={handleComplete}
                        size="lg"
                      >
                        Continue to Sign In
                      </EnhancedButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitialSystemSetup;