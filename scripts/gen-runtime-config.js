/* eslint-env node */
/* global process */
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load .env if exists
/* eslint-disable no-undef */
const envPath = path.resolve(process.cwd(), '.env')
/* eslint-enable no-undef */
let result = { }

if (fs.existsSync(envPath)) {
    result = dotenv.parse(fs.readFileSync(envPath))
}

const out = `window.__RUNTIME__ = {
  VITE_SUPABASE_URL: "${result.VITE_SUPABASE_URL ?? ''}",
  VITE_SUPABASE_ANON_KEY: "${result.VITE_SUPABASE_ANON_KEY ?? ''}"
}
`

/* eslint-disable no-undef */
const outPath = path.resolve(process.cwd(), 'public', 'runtime-config.js')
/* eslint-enable no-undef */
fs.writeFileSync(outPath, out, { encoding: 'utf8' })
console.log(`Wrote runtime config to ${outPath}`)
