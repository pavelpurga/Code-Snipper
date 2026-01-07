import { lazy } from 'react'
import { withSuspense } from '@/shared/ui/loadable.tsx'

const FavoritesPage = lazy(() => import('./FavoritesPage.tsx'))
export default withSuspense(FavoritesPage)

