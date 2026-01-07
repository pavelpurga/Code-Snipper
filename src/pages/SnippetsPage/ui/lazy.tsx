import { lazy } from 'react'
import { withSuspense } from '@/shared/ui/loadable.tsx'

const SnippetsPage = lazy(() => import('./SnippetsPage.tsx'))

export default withSuspense(SnippetsPage)
