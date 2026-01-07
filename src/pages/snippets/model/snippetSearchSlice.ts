import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface SearchState {
    query: string
}

const initialState: SearchState = {
    query: '',
}

export const snippetSearchSlice = createSlice({
    name: 'snippetSearch',
    initialState,
    reducers: {
        setQuery: (state, action: PayloadAction<string>) => {
            state.query = action.payload
        },
    },
})

export const { setQuery } = snippetSearchSlice.actions
export default snippetSearchSlice.reducer
