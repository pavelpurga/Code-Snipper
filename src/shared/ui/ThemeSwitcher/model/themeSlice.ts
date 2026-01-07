import { createSlice } from '@reduxjs/toolkit'

export type Theme = 'light' | 'dark'

// Применение темы к корневому html
export const applyTheme = (theme: Theme) => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
}

interface ThemeState {
  theme: Theme
}

// Читаем сохранённую тему из localStorage, если есть
const saved = (typeof window !== 'undefined' ? localStorage.getItem('app_theme') : null) as Theme | null

const initialState: ThemeState = {
    theme: saved ?? 'dark',
}

// Применяем тему на старте
applyTheme(initialState.theme)

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setTheme(state, action: { payload: Theme }) {
            state.theme = action.payload
            applyTheme(action.payload)
            try {
                localStorage.setItem('app_theme', action.payload)
            } catch (e) {
                // ignore storage errors
                console.warn('[theme] persist failed', e)
            }
        },
        toggleTheme(state) {
            state.theme = state.theme === 'dark' ? 'light' : 'dark'
            applyTheme(state.theme)
            try {
                localStorage.setItem('app_theme', state.theme)
            } catch (e) {
                console.warn('[theme] persist failed', e)
            }
        }
    }
})

export const { setTheme, toggleTheme } = themeSlice.actions
export const themeReducer = themeSlice.reducer
