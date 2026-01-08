import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
    globalIgnores(['dist', 'src/shared/config/supabase/api/types.ts']),
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            react,
            '@typescript-eslint': tseslint.plugin,
        },
        settings: {
            react: { version: 'detect' },
        },
        rules: {
            indent: ['error', 4, { SwitchCase: 1 }],
            quotes: ['error', 'single', { avoidEscape: true }],
            'jsx-quotes': ['error', 'prefer-single'],
            'object-curly-spacing': ['error', 'always'],
            'react/jsx-curly-spacing': ['error', { when: 'always', children: true }],
            'react/jsx-indent': ['error', 4],
            'react/jsx-indent-props': ['error', 4],
        },
    },
    // Allow Node globals inside scripts (build/runtime helper scripts)
    {
        files: ['scripts/**', 'scripts/**.*'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.node,
        },
    },
])
