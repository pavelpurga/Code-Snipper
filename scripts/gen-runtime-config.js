/* eslint-env node */
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load .env if exists
const envPath = path.resolve(process.cwd(), '.env')
let fileEnv = { }

if (fs.existsSync(envPath)) {
    fileEnv = dotenv.parse(fs.readFileSync(envPath))
}

// Prefer real process.env (CI / Docker runtime) and fall back to parsed .env file
const env = {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ?? fileEnv.VITE_SUPABASE_URL ?? '',
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ?? fileEnv.VITE_SUPABASE_ANON_KEY ?? '',
    VITE_CURRENCYLAYER_API_KEY: process.env.VITE_CURRENCYLAYER_API_KEY ?? fileEnv.VITE_CURRENCYLAYER_API_KEY ?? '',
}

const out = `window.__RUNTIME__ = {
  VITE_SUPABASE_URL: ${JSON.stringify(env.VITE_SUPABASE_URL)},
  VITE_SUPABASE_ANON_KEY: ${JSON.stringify(env.VITE_SUPABASE_ANON_KEY)},
  VITE_CURRENCYLAYER_API_KEY: ${JSON.stringify(env.VITE_CURRENCYLAYER_API_KEY)},
}
`

const outPath = path.resolve(process.cwd(), 'public', 'runtime-config.js')
fs.writeFileSync(outPath, out, { encoding: 'utf8' })
console.log(`Wrote runtime config to ${outPath}`)
