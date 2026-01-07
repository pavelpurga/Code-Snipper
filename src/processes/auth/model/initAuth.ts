import { supabase } from '@/shared/config/supabase/api/supabaseClient'
import { setSession, resetAuth } from './authSlice'
import { store } from '@/app/providers/store/store.tsx'
import { profileApi } from '@/features/users/api/usersApi'
import { snippetsApi } from '@/features/snippets/api/snippetsApi'
import { favoritesApi } from '@/features/snippets/api/favoritesApi'

export const initAuth = () => {
    supabase.auth.getSession().then(({ data }) => {
        store.dispatch(setSession(data.session))
        // Полный сброс состояний API + инвалидация тегов
        store.dispatch(profileApi.util.resetApiState())
        store.dispatch(snippetsApi.util.resetApiState())
        store.dispatch(favoritesApi.util.resetApiState())
        store.dispatch(profileApi.util.invalidateTags(['Profile', 'Users']))
    })

    supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
            store.dispatch(setSession(session))
            // Полный сброс состояний API при смене пользователя
            store.dispatch(profileApi.util.resetApiState())
            store.dispatch(snippetsApi.util.resetApiState())
            store.dispatch(favoritesApi.util.resetApiState())
            store.dispatch(profileApi.util.invalidateTags(['Profile', 'Users']))
        } else {
            store.dispatch(resetAuth())
            // Сброс при логауте
            store.dispatch(profileApi.util.resetApiState())
            store.dispatch(snippetsApi.util.resetApiState())
            store.dispatch(favoritesApi.util.resetApiState())
            store.dispatch(profileApi.util.invalidateTags(['Profile', 'Users']))
        }
    })
}
