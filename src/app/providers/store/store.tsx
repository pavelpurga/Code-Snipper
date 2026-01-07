import { configureStore, createSlice } from '@reduxjs/toolkit'
import { profileApi } from '@/features/users/api/usersApi.ts';
import { snippetsApi } from '@/features/snippets/api/snippetsApi.ts';
import { favoritesApi } from '@/features/snippets/api/favoritesApi'
import { currencyApi } from '@/features/currency/api/currencyApi'
import { themeReducer } from '@/shared/ui/ThemeSwitcher/model/themeSlice'

const sidebarSlice = createSlice({
    name: 'sidebar',
    initialState: { isOpen: false },
    reducers: {
        toggle(state) { state.isOpen = !state.isOpen },
        open(state) { state.isOpen = true },
        close(state) { state.isOpen = false },
    },
})

export const { toggle: toggleSidebar, open: openSidebar, close: closeSidebar } = sidebarSlice.actions

export const store = configureStore({
    reducer: {
        [profileApi.reducerPath]: profileApi.reducer,
        [snippetsApi.reducerPath]: snippetsApi.reducer,
        [favoritesApi.reducerPath]: favoritesApi.reducer,
        [currencyApi.reducerPath]: currencyApi.reducer,
        theme: themeReducer,
        sidebar: sidebarSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(profileApi.middleware, snippetsApi.middleware, favoritesApi.middleware, currencyApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
