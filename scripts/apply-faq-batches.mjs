#!/usr/bin/env node
/** Apply FAQ seed batches via Supabase Management API (uses MCP-equivalent SQL). */
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRef = process.env.SUPABASE_PROJECT_REF ?? 'ugbbfcerjcncxtbqwauw'
const accessToken = process.env.SUPABASE_ACCESS_TOKEN

if (!accessToken) {
  console.error('Set SUPABASE_ACCESS_TOKEN to apply seed via API')
  process.exit(1)
}

const dir = join(__dirname, '..', 'supabase', 'seeds', 'faq_batches')
const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()

for (const file of files) {
  const query = readFileSync(join(dir, file), 'utf8')
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
  const body = await res.text()
  if (!res.ok) {
    console.error(`Failed ${file}:`, body)
    process.exit(1)
  }
  console.log(`Applied ${file}`)
}

console.log('All FAQ batches applied.')
