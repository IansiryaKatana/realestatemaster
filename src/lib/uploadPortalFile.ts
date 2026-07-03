import { isSupabaseConfigured, tryGetSupabase } from '@/integrations/supabase/client'

export type PortalUploadBucket = 'tenant-files' | 'contracts' | 'agent-media'

export type PortalUploadResult = {
  publicUrl: string
  fileName: string
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

async function uploadWithXhr(
  file: File,
  uploadUrl: string,
  token: string,
  apiKey: string,
  onProgress?: (percent: number) => void,
) {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    })
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(xhr.responseText || `Upload failed (${xhr.status})`))
    })
    xhr.addEventListener('error', () => reject(new Error('Upload failed')))
    xhr.open('POST', uploadUrl)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.setRequestHeader('apikey', apiKey)
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    xhr.send(file)
  })
  onProgress?.(100)
}

export async function uploadPortalFile(
  file: File,
  bucket: PortalUploadBucket,
  folder: string,
  onProgress?: (percent: number) => void,
): Promise<PortalUploadResult> {
  if (!isSupabaseConfigured()) throw new Error('Supabase is not configured')
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Supabase is not configured')

  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  const userId = sessionData.session?.user?.id
  if (!token || !userId) throw new Error('You must be signed in to upload files')

  const baseUrl = import.meta.env.VITE_SUPABASE_URL
  const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!baseUrl || !apiKey) throw new Error('Supabase environment variables are missing')

  const safeName = sanitizeFileName(file.name)
  const path =
    bucket === 'tenant-files'
      ? `${userId}/${folder}/${Date.now()}-${safeName}`
      : `${folder}/${Date.now()}-${safeName}`

  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  const uploadUrl = `${baseUrl}/storage/v1/object/${bucket}/${encodedPath}`

  await uploadWithXhr(file, uploadUrl, token, apiKey, onProgress)

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path)
  return { publicUrl: publicData.publicUrl, fileName: file.name }
}
