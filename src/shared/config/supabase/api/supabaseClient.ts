import { createClient } from '@supabase/supabase-js'
import type { Database } from './types.ts'

// Локальные типы для безопасного приведения
type BuildEnv = {
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_ANON_KEY?: string
}

declare global {
  interface Window {
    __RUNTIME__?: Record<string, string | undefined>
  }
}

const getRuntimeEnv = () => {
    // Vite build-time envs (без any)
    const meta = import.meta as unknown as { env?: BuildEnv }
    const buildUrl = meta.env?.VITE_SUPABASE_URL
    const buildKey = meta.env?.VITE_SUPABASE_ANON_KEY

    // Runtime injection possibility: window.__RUNTIME__ (injected by server/nginx)
    const runtime = typeof window !== 'undefined' ? window.__RUNTIME__ : undefined

    const url = buildUrl ?? runtime?.VITE_SUPABASE_URL
    const key = buildKey ?? runtime?.VITE_SUPABASE_ANON_KEY

    return { url, key }
}

const { url: SUPABASE_URL, key: SUPABASE_ANON_KEY } = getRuntimeEnv()

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // Provide a clear, actionable error to help debugging in production
    throw new Error('Supabase configuration missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY at build time or provide them via runtime injection (window.__RUNTIME__).')
}

export const supabase = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
)