import FallbackLoading from '@/components/FallbackLoading'
import { ChildrenType } from '@/types/component-props'
import { Suspense } from 'react'

const AuthLayout = ({ children }: ChildrenType) => {
  console.info('🔐 [LAYOUT][Auth] Rendering AuthLayout with Suspense fallback')
  return <Suspense fallback={<FallbackLoading />}>{children}</Suspense>
}

export default AuthLayout
