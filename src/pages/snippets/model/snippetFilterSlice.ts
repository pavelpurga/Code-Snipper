import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface FilterState {
    language: string
    tags: string[]
}

const initialState: FilterState = {
    language: '',
    tags: [],
}

export const snippetFilterSlice = createSlice({
    name: 'snippetFilter',
    initialState,
    reducers: {
        setFilter: (state, action: PayloadAction<Partial<FilterState>>) => {
            if (action.payload.language !== undefined) state.language = action.payload.language
            if (action.payload.tags !== undefined) state.tags = action.payload.tags
        },
    },
})

export const { setFilter } = snippetFilterSlice.actions
export default snippetFilterSlice.reducer
