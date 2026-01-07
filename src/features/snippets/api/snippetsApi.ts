import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/shared/config/supabase/api/supabaseClient.ts';
import type { Tables } from '@/shared/config/supabase/api/types.ts';

type CreateSnippetDto = Omit<Tables<'snippets'>, 'id' | 'created_at' | 'updated_at'>;

export interface SnippetsPageArgs {
    page: number;
    pageSize: number;
    query?: string;
    language?: string | null;
    tags?: string[];
}

export interface SnippetsPageResponse {
    items: Tables<'snippets'>[];
    total: number;
}

export const snippetsApi = createApi({
    reducerPath: 'snippetsApi',
    baseQuery: fakeBaseQuery(),
    tagTypes: ['Snippet'],
    endpoints: (builder) => ({

        getSnippets: builder.query<Tables<'snippets'>[], void>({
            queryFn: async () => {
                const { data, error } = await supabase
                    .from('snippets')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) return { error };
                return { data: data as Tables<'snippets'>[] };
            },
            providesTags: ['Snippet'],
        }),

        getSnippetsPage: builder.query<SnippetsPageResponse, SnippetsPageArgs>({
            queryFn: async ({ page, pageSize, query, language, tags }) => {
                const from = Math.max(0, (page - 1) * pageSize);
                const to = from + pageSize - 1;

                // Хелперы для сборки запросов с фильтрами
                const buildCountQuery = () => {
                    let q = supabase
                        .from('snippets')
                        .select('*', { count: 'exact', head: true });
                    if (query && query.trim()) {
                        const qstr = `%${query.trim()}%`;
                        q = q.or(`title.ilike.${qstr},description.ilike.${qstr},code.ilike.${qstr}`);
                    }
                    if (language) {
                        q = q.eq('language', language);
                    }
                    if (tags && tags.length > 0) {
                        q = q.contains('tags', tags);
                    }
                    return q;
                };

                const buildDataQuery = () => {
                    let q = supabase
                        .from('snippets')
                        .select('*', { count: 'exact' })
                        .order('created_at', { ascending: false });
                    if (query && query.trim()) {
                        const qstr = `%${query.trim()}%`;
                        q = q.or(`title.ilike.${qstr},description.ilike.${qstr},code.ilike.${qstr}`);
                    }
                    if (language) {
                        q = q.eq('language', language);
                    }
                    if (tags && tags.length > 0) {
                        q = q.contains('tags', tags);
                    }
                    return q;
                };

                // 1) Получаем total через HEAD-запрос, чтобы избежать 416
                const { count: total, error: countError } = await buildCountQuery();
                if (countError) return { error: countError };

                const safeTotal = total ?? 0;
                if (from >= safeTotal) {
                    return { data: { items: [], total: safeTotal } };
                }

                // 2) Запрашиваем страницу данных в пределах диапазона
                const { data, error } = await buildDataQuery().range(from, to);
                if (error) return { error };
                return { data: { items: (data as Tables<'snippets'>[]) ?? [], total: safeTotal } };
            },
            providesTags: ['Snippet'],
        }),

        getSnippetById: builder.query<Tables<'snippets'>, string>({
            queryFn: async (id) => {
                const { data, error } = await supabase
                    .from('snippets')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) return { error };
                return { data: data as Tables<'snippets'> };
            },
            providesTags: (_result, _error, id) => [{ type: 'Snippet', id }],
        }),

        createSnippet: builder.mutation<Tables<'snippets'>, CreateSnippetDto>({
            queryFn: async (newSnippet) => {
                const { data, error } = await supabase
                    .from('snippets')
                    .insert([newSnippet])
                    .select()
                    .single();

                if (error) return { error };
                return { data: data as Tables<'snippets'> };
            },
            invalidatesTags: ['Snippet'],
        }),

        updateSnippet: builder.mutation<Tables<'snippets'>, Partial<Tables<'snippets'>> & { id: string }>({
            queryFn: async ({ id, ...patch }) => {
                const { data, error } = await supabase
                    .from('snippets')
                    .update(patch)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) return { error };
                return { data: data as Tables<'snippets'> };
            },
            invalidatesTags: (_result, _error, { id }) => ['Snippet', { type: 'Snippet', id }],        }),

        deleteSnippet: builder.mutation<{ success: boolean }, string>({
            queryFn: async (id) => {
                const { error } = await supabase
                    .from('snippets')
                    .delete()
                    .eq('id', id);

                if (error) return { error };
                return { data: { success: true } };
            },
            invalidatesTags: ['Snippet'],
        }),

        getUserSnippets: builder.query<Tables<'snippets'>[], { userId: string; query?: string; language?: string | null; tags?: string[] }>({
            queryFn: async ({ userId, query = '', language, tags = [] }) => {
                try {
                    let req = supabase
                        .from('snippets')
                        .select('*')
                        .eq('user_id', userId)
                        .order('created_at', { ascending: false })
                    if (language) req = req.eq('language', language)
                    if (tags.length) req = req.contains('tags', tags)
                    if (query) req = req.ilike('title', `%${query}%`)
                    const { data, error } = await req
                    if (error) return { error }
                    return { data: (data ?? []) as Tables<'snippets'>[] }
                } catch (e) {
                    const err = e instanceof Error ? e : new Error(typeof e === 'string' ? e : JSON.stringify(e))
                    return { error: err }
                }
            }
        })
    }),
});

export const {
    useGetSnippetsQuery,
    useGetSnippetsPageQuery,
    useGetSnippetByIdQuery,
    useCreateSnippetMutation,
    useUpdateSnippetMutation,
    useDeleteSnippetMutation,
    useGetUserSnippetsQuery,
} = snippetsApi;