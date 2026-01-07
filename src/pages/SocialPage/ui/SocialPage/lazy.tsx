import { lazy } from 'react'
import { withSuspense } from '@/shared/ui/loadable.tsx'

const SocialCommunityPage = lazy(() => import('./SocialPage.tsx'))
export default withSuspense(SocialCommunityPage)

