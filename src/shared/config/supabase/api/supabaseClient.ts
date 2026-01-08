import { createClient } from '@supabase/supabase-js'
import type { Database } from './types.ts'

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
    const meta = import.meta as unknown as { env?: BuildEnv }
    const buildUrl = meta.env?.VITE_SUPABASE_URL
    const buildKey = meta.env?.VITE_SUPABASE_ANON_KEY

    const runtime = typeof window !== 'undefined' ? window.__RUNTIME__ : undefined

    const url = buildUrl ?? runtime?.VITE_SUPABASE_URL
    const key = buildKey ?? runtime?.VITE_SUPABASE_ANON_KEY

    return { url, key }
}

const { url: rawUrl, key: rawKey } = getRuntimeEnv()

function sanitizeEnvValue(val?: string) {
    if (!val) return undefined
    const trimmed = String(val).trim()
    if (trimmed === '' || trimmed.includes('${') || trimmed.match(/^\$\{?VITE_/) ) return undefined
    return trimmed
}

const SUPABASE_URL = sanitizeEnvValue(rawUrl)
const SUPABASE_ANON_KEY = sanitizeEnvValue(rawKey)

function isValidHttpUrl(value?: string) {
    if (!value) return false
    try {
        const u = new URL(value)
        return u.protocol === 'http:' || u.protocol === 'https:'
    } catch {
        return false
    }
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
        'Supabase configuration missing or contains unreplaced placeholders: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (for dev place them in .env.local/.env; for production provide them as runtime environment variables).\n' +
        'If you see values like "${VITE_SUPABASE_URL}" in public/runtime-config.js, regenerate the file or ensure your deploy step writes real values.'
    )
}

if (!isValidHttpUrl(SUPABASE_URL)) {
    throw new Error(
        `Invalid Supabase URL provided in VITE_SUPABASE_URL: "${SUPABASE_URL}". It must be a valid http or https URL (for example: https://your-project.supabase.co).`,
    )
}

export const supabase = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
)