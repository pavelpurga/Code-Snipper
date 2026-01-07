import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/shared/config/supabase/api/supabaseClient.ts';
import type { Tables } from '@/shared/config/supabase/api/types.ts';


export const profileApi = createApi({
    reducerPath: 'profileApi',
    baseQuery: fakeBaseQuery(),
    tagTypes: ['Profile', 'Users'],
    keepUnusedDataFor: 0,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    endpoints: (builder) => ({
        getProfileId: builder.query<Tables<'profiles'>, void>({
            queryFn: async () => {
                const { data: userRes, error: authError } = await supabase.auth.getUser()
                if (authError) return { error: authError }
                const userId = userRes.user?.id
                if (!userId) {
                    return { error: { name: 'NoAuth', message: 'User not authenticated' } as unknown as Error }
                }

                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, user_name, email, developer_type, about')
                    .eq('id', userId)
                    .single();

                if (error) return { error };
                const row = data as Tables<'profiles'>
                return { data: row };
            },
            providesTags: (result) => [{ type: 'Profile', id: result?.id ?? 'CURRENT' }]
        }),
        getUserById: builder.query<Tables<'profiles'>, string>({
            queryFn: async (id: string) => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, user_name, email, developer_type, about')
                    .eq('id', id)
                    .single()
                if (error) return { error }
                return { data: data as Tables<'profiles'> }
            },
            providesTags: (result) => [{ type: 'Profile', id: result?.id ?? 'UNKNOWN' }]
        }),
        getUsers: builder.query<Tables<'profiles'>[], void>({
            queryFn: async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, user_name, email, developer_type, about')
                    .order('user_name', { ascending: true });
                if (error) return { error };
                const rows = (data ?? []) as Tables<'profiles'>[]
                return { data: rows };
            },
            providesTags: () => [{ type: 'Users', id: 'LIST' }]
        })
    }),
});

export const { useGetProfileIdQuery, useGetUsersQuery, useGetUserByIdQuery } = profileApi;
