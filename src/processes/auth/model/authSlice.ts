import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Session, User } from '@supabase/supabase-js'

interface AuthState {
    user: User | null
    session: Session | null
    initialized: boolean
}

const initialState: AuthState = {
    user: null,
    session: null,
    initialized: false,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setSession(state, action: PayloadAction<Session | null>) {
            state.session = action.payload
            state.user = action.payload?.user ?? null
            state.initialized = true
        },
        resetAuth(state) {
            state.session = null
            state.user = null
            state.initialized = true
        },
    },
})

export const { setSession, resetAuth } = authSlice.actions
export const authReducer = authSlice.reducer
