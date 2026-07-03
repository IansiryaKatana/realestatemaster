/**
 * Downloads seed media files listed in supabase/seed-media/manifest.json.
 * Run once after updating the manifest, or to refresh from live URLs.
 */
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const mediaRoot = path.join(root, 'supabase', 'seed-media', 'cms-media')
const manifestPath = path.join(root, 'supabase', 'seed-media', 'manifest.json')

function contentTypeForPath(storagePath) {
  const ext = path.extname(storagePath).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.jpeg' || ext === '.jpg') return 'image/jpeg'
  if (ext === '.webp') return 'image/webp'
  return 'application/octet-stream'
}

async function downloadToFile(url, dest) {
  await mkdir(path.dirname(dest), { recursive: true })
  try {
    const info = await stat(dest)
    if (info.size > 0) return info.size
  } catch {
    // missing — download below
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed ${res.status} ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(dest, buf)
  return buf.length
}

async function main() {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  const tasks = []

  for (const item of manifest.cmsMedia ?? []) {
    tasks.push({
      url: item.sourceUrl,
      dest: path.join(mediaRoot, item.storagePath),
      label: item.storagePath,
    })
  }
  for (const item of manifest.externalImages ?? []) {
    tasks.push({
      url: item.sourceUrl,
      dest: path.join(mediaRoot, item.storagePath),
      label: item.storagePath,
    })
  }

  let totalBytes = 0
  for (const task of tasks) {
    const bytes = await downloadToFile(task.url, task.dest)
    totalBytes += bytes
    console.log(`OK ${task.label} (${(bytes / 1024).toFixed(1)} KB)`)
  }

  console.log(`\nDownloaded ${tasks.length} files (${(totalBytes / 1024 / 1024).toFixed(2)} MB) to supabase/seed-media/cms-media/`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
