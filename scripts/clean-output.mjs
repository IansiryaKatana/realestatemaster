import { execSync } from 'node:child_process'
import { existsSync, lstatSync, readdirSync, renameSync, rmSync, rmdirSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(rootDir, '..')

function removeEntry(target) {
  if (!existsSync(target)) return

  const stat = lstatSync(target)
  if (!stat.isDirectory()) {
    unlinkSync(target)
    return
  }

  for (const entry of readdirSync(target)) {
    removeEntry(path.join(target, entry))
  }

  rmdirSync(target)
}

function removeDir(target) {
  if (!existsSync(target)) return true

  const attempts = [
    () => rmSync(target, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }),
    () => {
      if (process.platform === 'win32') {
        execSync(`cmd /c rmdir /s /q "${target}"`, { stdio: 'ignore' })
      }
    },
    () => removeEntry(target),
    () => {
      const trashed = `${target}.old-${Date.now()}`
      renameSync(target, trashed)
      removeEntry(trashed)
    },
  ]

  for (const attempt of attempts) {
    try {
      attempt()
      if (!existsSync(target)) return true
    } catch {
      // Try the next strategy.
    }
  }

  console.warn(
    `[clean-output] Could not remove ${path.relative(projectRoot, target)}. ` +
      'Stop any running dev/preview/build processes, then delete it manually if needed.',
  )
  return false
}

let hadFailure = false

for (const dir of ['.output', '.nitro-output', '.vercel/output']) {
  if (!removeDir(path.join(projectRoot, dir))) hadFailure = true
}

if (hadFailure) {
  console.warn('[clean-output] Continuing build anyway.')
}
