import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as yup from 'yup'

import { useAuthContext } from '@/context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'

const useSignIn = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signIn, loading } = useAuthContext()
  const { showNotification } = useNotificationContext()

  const loginFormSchema = yup.object({
    email: yup.string()
      .email('Please enter a valid email')
      .required('Please enter your email')
      .trim()
      .max(255, 'Email must be less than 255 characters'),
    password: yup.string()
      .required('Please enter your password')
      .min(6, 'Password must be at least 6 characters')
      .max(128, 'Password must be less than 128 characters'),
  })

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  type LoginFormFields = yup.InferType<typeof loginFormSchema>

  const redirectUser = () => {
    const redirectLink = searchParams.get('redirectTo')
    if (redirectLink) navigate(redirectLink)
    else navigate('/admin/dashboards')
  }

  const login = handleSubmit(async (values: LoginFormFields) => {
    try {
      const { error } = await signIn(values.email.trim(), values.password)
      
      if (error) {
        console.error('Sign in error details:', error);
        if (error.message === 'Invalid login credentials') {
          showNotification({ 
            message: 'Invalid email or password. Please check your credentials and try again.', 
            variant: 'danger' 
          })
        } else if (error.message === 'Email not confirmed') {
          showNotification({ 
            message: 'Please check your email and click the confirmation link before signing in.', 
            variant: 'warning' 
          })
        } else {
          showNotification({ 
            message: error.message || 'An error occurred during sign in. Please try again.', 
            variant: 'danger' 
          })
        }
      } else {
        showNotification({ 
          message: 'Successfully signed in. Welcome back!', 
          variant: 'success' 
        })
        redirectUser()
      }
    } catch (error) {
      console.error('Sign in error:', error)
      showNotification({ 
        message: 'An unexpected error occurred. Please try again.', 
        variant: 'danger' 
      })
    }
  })

  return { loading, login, control }
}

export default useSignIn
