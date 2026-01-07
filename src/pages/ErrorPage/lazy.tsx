import { lazy } from 'react'
import { withSuspense } from '@/shared/ui/loadable'

const ErrorPage = lazy(() => import('./ui/ErrorPage'))
export default withSuspense(ErrorPage)

