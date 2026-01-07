import type { RouteProps } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/shared/ui/ProtectedRoute.tsx';
import { SnippetsPageLazy } from '@/pages/SnippetsPage';
import AuthPage from '@/pages/AuthPage/index.ts';
import { FavoritesPageLazy } from '@/pages/FavoritesPage';
import { AboutPageLazy } from '@/pages/AboutPage';
import { ErrorPageLazy } from '@/pages/ErrorPage';
import { SocialCommunityPageLazy } from '@/pages/SocialPage';
import { UserProfileLazy } from '@/pages/Users';

const AppRoutes = {
    MAIN: 'main',
    AUTH: 'auth',
    SNIPPETS: 'snippets',
    FAVORITES: 'favorites',
    ABOUT: 'about',
    ERROR: 'error',
    REDIRECT: 'redirect',
    SOCIAL: 'social',
    USER_PROFILE: 'user_profile',
} as const
type AppRoutes = (typeof AppRoutes)[keyof typeof AppRoutes];


export const RoutePath: Record<AppRoutes, string> = {
    [AppRoutes.MAIN]: '/',
    [AppRoutes.AUTH]: '/auth',
    [AppRoutes.SNIPPETS]: '/snippets',
    [AppRoutes.FAVORITES]: '/favorites',
    [AppRoutes.ABOUT]: '/about',
    [AppRoutes.ERROR]: '/error',
    [AppRoutes.REDIRECT]: '*',
    [AppRoutes.SOCIAL]: '/social',
    [AppRoutes.USER_PROFILE]: '/users/:id',
}

export const routeConfig: Record<AppRoutes, RouteProps> = {
    [AppRoutes.MAIN]: {
        path: RoutePath.main,
        element: <Navigate to={ RoutePath.snippets } replace />
    },
    [AppRoutes.SNIPPETS]: {
        path: RoutePath.snippets,
        element:
    <ProtectedRoute redirectTo={ RoutePath.auth }>
        <SnippetsPageLazy />
    </ProtectedRoute>
    },
    [AppRoutes.AUTH]: {
        path: RoutePath.auth,
        element: <AuthPage />
    },
    [AppRoutes.REDIRECT]: {
        path: RoutePath.redirect,
        element: <Navigate to={ RoutePath.snippets } replace />
    },
    [AppRoutes.FAVORITES]: {
        path: RoutePath.favorites,
        element:
    <ProtectedRoute redirectTo={ RoutePath.auth }>
        <FavoritesPageLazy />
    </ProtectedRoute>
    },
    [AppRoutes.ABOUT]: {
        path: RoutePath.about,
        element:
    <ProtectedRoute redirectTo={ RoutePath.auth }>
        <AboutPageLazy />
    </ProtectedRoute>
    },
    [AppRoutes.ERROR]: {
        path: RoutePath.error,
        element: <ErrorPageLazy />
    },
    [AppRoutes.SOCIAL]: {
        path: RoutePath.social,
        element: <SocialCommunityPageLazy />
    },
    [AppRoutes.USER_PROFILE]: {
        path: RoutePath.user_profile,
        element:
    <ProtectedRoute redirectTo={ RoutePath.auth }>
        <UserProfileLazy />
    </ProtectedRoute>
    }
}