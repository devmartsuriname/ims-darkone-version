import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedButton } from '@/components/ui/EnhancedButtons';
import { toast } from 'react-toastify';

interface InitialSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const InitialSetupModal: React.FC<InitialSetupModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
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

  const createInitialAdmin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('user-management', {
        body: {
          action: 'create',
          email: adminData.email,
          password: adminData.password,
          name: `${adminData.firstName} ${adminData.lastName}`,
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          phone: adminData.phone,
          department: adminData.department,
          position: adminData.position,
          roles: ['admin'], // Initial admin role
        }
      });

      if (error) {
        throw error;
      }

      toast.success('Initial admin user created successfully!');
      setStep(2);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create admin user');
    } finally {
      setLoading(false);
    }
  };

  const completeSetup = () => {
    localStorage.setItem('ims_initial_setup_complete', 'true');
    onSuccess();
    onClose();
    toast.success('System setup completed! You can now sign in with your admin credentials.');
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="bi bi-gear-fill me-2"></i>
              Initial System Setup
            </h5>
          </div>
          <div className="modal-body">
            {step === 1 ? (
              <div>
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Welcome to IMS!</strong> Let's create your first administrator account to get started.
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
                    placeholder="Enter email address"
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
                    placeholder="Enter password (min 6 characters)"
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
                    placeholder="Enter phone number"
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
                        placeholder="Enter department"
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
                        placeholder="Enter position"
                      />
                    </div>
                  </div>
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
                <div className="alert alert-success">
                  <strong>Admin Email:</strong> {adminData.email}
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            {step === 1 ? (
              <EnhancedButton
                variant="primary"
                onClick={createInitialAdmin}
                loading={loading}
                disabled={
                  loading ||
                  !adminData.email ||
                  !adminData.password ||
                  !adminData.firstName ||
                  !adminData.lastName ||
                  adminData.password.length < 6
                }
                fullWidth
              >
                Create Administrator Account
              </EnhancedButton>
            ) : (
              <EnhancedButton
                variant="success"
                onClick={completeSetup}
                fullWidth
              >
                Continue to Sign In
              </EnhancedButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitialSetupModal;