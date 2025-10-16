import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { EnhancedButton } from '@/components/ui/EnhancedButtons';
import { toast } from 'react-toastify';
import TextFormInput from '@/components/from/TextFormInput';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

type UserProfile = Database['public']['Tables']['profiles']['Row'];
type AppRole = Database['public']['Enums']['app_role'];

interface UserModalProps {
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const userSchema = yup.object({
  email: yup.string()
    .email('Please enter a valid email')
    .required('Email is required')
    .trim()
    .max(255, 'Email must be less than 255 characters'),
  firstName: yup.string()
    .required('First name is required')
    .trim()
    .max(100, 'First name must be less than 100 characters'),
  lastName: yup.string()
    .required('Last name is required')
    .trim()
    .max(100, 'Last name must be less than 100 characters'),
  phone: yup.string()
    .trim()
    .max(20, 'Phone must be less than 20 characters'),
  department: yup.string()
    .trim()
    .max(100, 'Department must be less than 100 characters'),
  position: yup.string()
    .trim()
    .max(100, 'Position must be less than 100 characters'),
  password: yup.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be less than 128 characters'),
});

const UserModal: React.FC<UserModalProps> = ({
  userId,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [isActive, setIsActive] = useState(true);

  const isEditing = !!userId;

  const { control, handleSubmit, reset, setValue } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      department: '',
      position: '',
      password: '',
    },
  });

  const availableRoles: { value: AppRole; label: string }[] = [
    { value: 'admin', label: 'Administrator' },
    { value: 'it', label: 'IT Support' },
    { value: 'staff', label: 'Staff Member' },
    { value: 'control', label: 'Control Inspector' },
    { value: 'director', label: 'Director' },
    { value: 'minister', label: 'Minister' },
    { value: 'front_office', label: 'Front Office' },
    { value: 'applicant', label: 'Applicant' },
  ];

  // Fetch user data when editing
  useEffect(() => {
    if (isEditing && userId && isOpen) {
      fetchUserData();
    } else if (!isEditing && isOpen) {
      // Reset form for new user
      reset();
      setSelectedRoles(['applicant']); // Default role
      setIsActive(true);
    }
  }, [userId, isOpen, isEditing, reset]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId!)
        .single();

      if (profileError) {
        toast.error('Failed to load user data');
        return;
      }

      setUserData(profile);
      setIsActive(profile.is_active ?? true);

      // Set form values
      setValue('email', profile.email || '');
      setValue('firstName', profile.first_name || '');
      setValue('lastName', profile.last_name || '');
      setValue('phone', profile.phone || '');
      setValue('department', profile.department || '');
      setValue('position', profile.position || '');

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId!)
        .eq('is_active', true);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      } else if (roles) {
        setSelectedRoles(roles.map(role => role.role));
      }
    } catch (error) {
      toast.error('Failed to load user data');
      console.error('Error:', error);
    }
  };

  const handleSubmitForm = handleSubmit(async (values) => {
    setLoading(true);
    try {
      if (isEditing) {
        await updateUser(values);
      } else {
        await createUser(values);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  });

  const createUser = async (values: any) => {
    if (selectedRoles.length === 0) {
      toast.error('Please select at least one role');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('user-management', {
        body: {
          action: 'create',
          email: values.email,
          password: values.password,
          first_name: values.firstName,
          last_name: values.lastName,
          phone: values.phone,
          department: values.department,
          position: values.position,
          roles: selectedRoles,
        }
      });

      // Debug logging
      console.log('CreateUser response', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to create user');
      }

      if (!data?.success) {
        console.error('User creation failed:', data);
        throw new Error(data?.error || 'Failed to create user');
      }

      toast.success('User created successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Create user error:', error);
      toast.error(error.message || 'Failed to create user', { autoClose: 6000 });
    }
  };

  const updateUser = async (values: any) => {
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: values.firstName,
          last_name: values.lastName,
          phone: values.phone,
          department: values.department,
          position: values.position,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId!);

      if (profileError) {
        throw profileError;
      }

      // Update roles - deactivate old roles and create new ones
      const { error: deactivateError } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId!);

      if (deactivateError) {
        throw deactivateError;
      }

      // Insert new roles
      if (selectedRoles.length > 0) {
        const rolesToInsert = selectedRoles.map(role => ({
          user_id: userId!,
          role: role,
          assigned_by: userData?.id, // Current user
          is_active: true,
        }));

        const { error: rolesError } = await supabase
          .from('user_roles')
          .insert(rolesToInsert);

        if (rolesError) {
          throw rolesError;
        }
      }

      toast.success('User updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    }
  };

  const handleRoleChange = (role: AppRole, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, role]);
    } else {
      setSelectedRoles(prev => prev.filter(r => r !== role));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ pointerEvents: 'none' }}></div>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="userModalTitle">
        <div className="modal-dialog modal-lg">
          <div className="modal-content" style={{ position: 'relative', zIndex: 1060 }}>
            <div className="modal-header">
              <h5 id="userModalTitle" className="modal-title">
                {isEditing ? 'Edit User' : 'Create New User'}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <form onSubmit={handleSubmitForm}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <TextFormInput
                      control={control}
                      name="firstName"
                      label="First Name"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <TextFormInput
                      control={control}
                      name="lastName"
                      label="Last Name"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <TextFormInput
                      control={control}
                      name="email"
                      label="Email Address"
                      type="email"
                      placeholder="Enter email address"
                      required
                      disabled={isEditing} // Can't change email for existing users
                    />
                  </div>
                  <div className="col-md-6">
                    <TextFormInput
                      control={control}
                      name="phone"
                      label="Phone Number"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                {!isEditing && (
                  <div className="row">
                    <div className="col-12">
                      <TextFormInput
                        control={control}
                        name="password"
                        label="Password"
                        type="password"
                        placeholder="Enter password (min 6 characters)"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="row">
                  <div className="col-md-6">
                    <TextFormInput
                      control={control}
                      name="department"
                      label="Department"
                      placeholder="Enter department"
                    />
                  </div>
                  <div className="col-md-6">
                    <TextFormInput
                      control={control}
                      name="position"
                      label="Position"
                      placeholder="Enter position"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="row">
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="userActiveSwitch"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="userActiveSwitch">
                          User is active
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="row mt-3">
                  <div className="col-12">
                    <label className="form-label">User Roles</label>
                    <div className="row">
                      {availableRoles.map((role) => (
                        <div key={role.value} className="col-md-4 mb-2">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`role-${role.value}`}
                              checked={selectedRoles.includes(role.value)}
                              onChange={(e) => handleRoleChange(role.value, e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor={`role-${role.value}`}>
                              {role.label}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedRoles.length === 0 && (
                      <small className="text-danger">Please select at least one role</small>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <EnhancedButton
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={selectedRoles.length === 0}
                >
                  {isEditing ? 'Update User' : 'Create User'}
                </EnhancedButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserModal;