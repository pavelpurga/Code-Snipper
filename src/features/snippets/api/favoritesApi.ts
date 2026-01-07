import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { supabase } from '@/shared/config/supabase/api/supabaseClient'
import type { Tables } from '@/shared/config/supabase/api/types'
import type { SupabaseClient } from '@supabase/supabase-js'

// Локальные типы для ответов favorites
type FavoriteIdRow = { snippet_id: string }
type FavoriteJoinRow = { snippets: Tables<'snippets'> | null }

const sb = supabase as unknown as SupabaseClient

export const favoritesApi = createApi({
    reducerPath: 'favoritesApi',
    baseQuery: fakeBaseQuery(),
    tagTypes: ['Favorites'],
    endpoints: (builder) => ({
        getFavoriteIds: builder.query<string[], void>({
            queryFn: async () => {
                const { data: auth } = await sb.auth.getUser()
                const uid = auth?.user?.id
                if (!uid) return { data: [] }
                const { data, error } = await sb
                    .from('favorites')
                    .select('snippet_id')
                    .eq('user_id', uid)
                if (error) return { error }
                const rows = (data ?? []) as FavoriteIdRow[]
                return { data: rows.map(r => r.snippet_id) }
            },
            providesTags: ['Favorites'],
        }),

        getFavoriteSnippets: builder.query<Tables<'snippets'>[], void>({
            queryFn: async () => {
                const { data: auth } = await sb.auth.getUser()
                const uid = auth?.user?.id
                if (!uid) return { data: [] }
                const { data, error } = await sb
                    .from('favorites')
                    .select('snippets(*)')
                    .eq('user_id', uid)
                if (error) return { error }
                const rows = (data ?? []) as unknown as FavoriteJoinRow[]
                const items = rows.map(row => row.snippets).filter(Boolean) as Tables<'snippets'>[]
                return { data: items }
            },
            providesTags: ['Favorites'],
        }),

        toggleFavorite: builder.mutation<{ ok: true }, { id: string; next: boolean }>({
            queryFn: async ({ id, next }) => {
                const { data: auth } = await sb.auth.getUser()
                const uid = auth?.user?.id
                if (!uid) return { data: { ok: true } }
                if (next) {
                    const { error } = await sb
                        .from('favorites')
                        .upsert({ user_id: uid, snippet_id: id }, { onConflict: 'user_id,snippet_id', ignoreDuplicates: true })
                    if (error) return { error }
                } else {
                    const { error } = await sb
                        .from('favorites')
                        .delete()
                        .eq('user_id', uid)
                        .eq('snippet_id', id)
                    if (error) return { error }
                }
                return { data: { ok: true } }
            },
            invalidatesTags: ['Favorites'],
        }),
    }),
})

export const {
    useGetFavoriteIdsQuery,
    useGetFavoriteSnippetsQuery,
    useToggleFavoriteMutation,
} = favoritesApi

