import { lazy } from 'react'
import { withSuspense } from '@/shared/ui/loadable.tsx'

const UserProfile = lazy(() => import('./UserProfile.tsx'))
export default withSuspense(UserProfile)

