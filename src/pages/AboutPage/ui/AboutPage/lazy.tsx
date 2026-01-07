import { lazy } from 'react'
import { withSuspense } from '@/shared/ui/loadable.tsx'

const AboutPage = lazy(() => import('./AboutPage.tsx'))
export default withSuspense(AboutPage)

