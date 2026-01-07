import '@testing-library/jest-dom'

jest.mock('@/shared/config/supabase/api/supabaseClient', () => ({
    supabase: {
        auth: {
            signOut: jest.fn().mockResolvedValue({ error: null }),
            getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
        },
        from: jest.fn(() => ({
            select: jest.fn(() => ({ data: [], error: null })),
            insert: jest.fn(() => ({ data: [], error: null })),
            delete: jest.fn(() => ({ data: [], error: null })),
            update: jest.fn(() => ({ data: [], error: null })),
            eq: jest.fn(() => ({ data: [], error: null })),
            in: jest.fn(() => ({ data: [], error: null })),
        })),
    },
}))
