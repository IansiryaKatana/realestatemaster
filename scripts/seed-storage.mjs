/**
 * Uploads bundled seed media to Supabase Storage and rewrites DB image URLs.
 *
 * Requires in .env (or environment):
 *   VITE_SUPABASE_URL (or SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage: npm run seed:media
 */
import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const mediaRoot = path.join(root, 'supabase', 'seed-media', 'cms-media')
const manifestPath = path.join(root, 'supabase', 'seed-media', 'manifest.json')

async function loadEnvFile() {
  try {
    const raw = await readFile(path.join(root, '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const value = trimmed.slice(eq + 1).trim()
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // optional
  }
}

function contentTypeForPath(storagePath) {
  const ext = path.extname(storagePath).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.jpeg' || ext === '.jpg') return 'image/jpeg'
  if (ext === '.webp') return 'image/webp'
  return 'application/octet-stream'
}

function publicUrl(base, bucket, storagePath) {
  return `${base.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${storagePath}`
}

async function replaceInRows(supabase, table, columns, urlMap) {
  const { data, error } = await supabase.from(table).select('id, ' + columns.join(', '))
  if (error) throw new Error(`${table}: ${error.message}`)
  for (const row of data ?? []) {
    const patch = {}
    for (const col of columns) {
      const val = row[col]
      if (val == null) continue
      if (typeof val === 'string' && urlMap[val]) {
        patch[col] = urlMap[val]
        continue
      }
      if (Array.isArray(val)) {
        const next = val.map((u) => (typeof u === 'string' ? urlMap[u] ?? u : u))
        if (JSON.stringify(next) !== JSON.stringify(val)) patch[col] = next
      }
    }
    if (Object.keys(patch).length) {
      const { error: upErr } = await supabase.from(table).update(patch).eq('id', row.id)
      if (upErr) throw new Error(`${table} update ${row.id}: ${upErr.message}`)
    }
  }
}

async function main() {
  await loadEnvFile()
  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env')
  }

  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  const bucket = manifest.bucket ?? 'cms-media'
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
  const urlMap = {}

  const uploadPaths = new Map()
  for (const item of manifest.cmsMedia ?? []) {
    uploadPaths.set(item.storagePath, item.storagePath)
  }
  for (const item of manifest.externalImages ?? []) {
    uploadPaths.set(item.storagePath, item.storagePath)
  }

  for (const storagePath of uploadPaths.keys()) {
    const filePath = path.join(mediaRoot, storagePath)
    const body = await readFile(filePath)
    const { error } = await supabase.storage.from(bucket).upload(storagePath, body, {
      upsert: true,
      contentType: contentTypeForPath(storagePath),
    })
    if (error) throw new Error(`Upload ${storagePath}: ${error.message}`)
    const pub = publicUrl(supabaseUrl, bucket, storagePath)
    console.log(`Uploaded ${storagePath}`)
    urlMap[pub] = pub
  }

  for (const item of manifest.cmsMedia ?? []) {
    urlMap[item.sourceUrl] = publicUrl(supabaseUrl, bucket, item.storagePath)
  }
  for (const item of manifest.externalImages ?? []) {
    urlMap[item.sourceUrl] = publicUrl(supabaseUrl, bucket, item.storagePath)
  }

  for (const item of manifest.cmsMedia ?? []) {
    const pub = publicUrl(supabaseUrl, bucket, item.storagePath)
    const { error } = await supabase.from('cms_media').upsert(
      {
        id: item.id,
        public_url: pub,
        folder: item.folder,
        kind: item.kind,
        file_name: item.fileName,
      },
      { onConflict: 'id' },
    )
    if (error) throw new Error(`cms_media ${item.id}: ${error.message}`)
  }

  await replaceInRows(supabase, 'products', ['image_url', 'gallery_urls'], urlMap)
  await replaceInRows(supabase, 'hero_slides', ['image_url'], urlMap)
  await replaceInRows(supabase, 'feature_cards', ['image_url'], urlMap)
  await replaceInRows(supabase, 'lifestyle_cards', ['image_url'], urlMap)
  await replaceInRows(supabase, 'agents', ['photo_url'], urlMap)
  await replaceInRows(supabase, 'homepage_sections', ['image_url'], urlMap)
  await replaceInRows(supabase, 'collections', ['cover_image_url'], urlMap)
  await replaceInRows(supabase, 'order_items', ['image_url'], urlMap)

  for (const row of (await supabase.from('cms_media').select('id, public_url')).data ?? []) {
    const next = urlMap[row.public_url]
    if (next && next !== row.public_url) {
      await supabase.from('cms_media').update({ public_url: next }).eq('id', row.id)
    }
  }

  const siteSettings = manifest.siteSettings ?? {}
  for (const [key, storagePath] of Object.entries(siteSettings)) {
    const pub = publicUrl(supabaseUrl, bucket, storagePath)
    await supabase.from('site_settings').upsert({ key, value: pub }, { onConflict: 'key' })
  }

  console.log('\nSeed media upload complete. Image URLs updated in database.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
