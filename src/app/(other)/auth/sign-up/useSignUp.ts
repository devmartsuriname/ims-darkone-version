import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import * as yup from 'yup'

import { useAuthContext } from '@/context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'

const useSignUp = () => {
  const navigate = useNavigate()
  const { signUp, loading } = useAuthContext()
  const { showNotification } = useNotificationContext()

  const signUpFormSchema = yup.object({
    firstName: yup.string()
      .required('Please enter your first name')
      .trim()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters'),
    lastName: yup.string()
      .required('Please enter your last name')
      .trim()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters'),
    email: yup.string()
      .email('Please enter a valid email')
      .required('Please enter your email')
      .trim()
      .max(255, 'Email must be less than 255 characters'),
    password: yup.string()
      .required('Please enter your password')
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    confirmPassword: yup.string()
      .required('Please confirm your password')
      .oneOf([yup.ref('password')], 'Passwords must match'),
    terms: yup.boolean()
      .oneOf([true], 'You must accept the terms and conditions')
  })

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(signUpFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  })

  type SignUpFormFields = yup.InferType<typeof signUpFormSchema>

  const register = handleSubmit(async (values: SignUpFormFields) => {
    try {
      const { error } = await signUp(
        values.email.trim(), 
        values.password,
        {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
        }
      )
      
      if (error) {
        if (error.message === 'User already registered') {
          showNotification({ 
            message: 'An account with this email already exists. Please sign in instead.', 
            variant: 'warning' 
          })
        } else if (error.message.includes('Password')) {
          showNotification({ 
            message: 'Password does not meet security requirements. Please choose a stronger password.', 
            variant: 'danger' 
          })
        } else {
          showNotification({ 
            message: error.message || 'An error occurred during registration. Please try again.', 
            variant: 'danger' 
          })
        }
      } else {
        showNotification({ 
          message: 'Registration successful! Please check your email to confirm your account before signing in.', 
          variant: 'success' 
        })
        navigate('/auth/sign-in')
      }
    } catch (error) {
      console.error('Sign up error:', error)
      showNotification({ 
        message: 'An unexpected error occurred. Please try again.', 
        variant: 'danger' 
      })
    }
  })

  return { loading, register, control }
}

export default useSignUp