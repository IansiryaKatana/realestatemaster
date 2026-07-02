import { rmSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

for (const dir of ['.output', '.vercel/output']) {
  const target = path.join(rootDir, '..', dir)
  if (existsSync(target)) rmSync(target, { recursive: true, force: true })
}
