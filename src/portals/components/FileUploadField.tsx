import { useRef, useState } from 'react'
import { FileUp, Loader2, X } from 'lucide-react'
import { uploadPortalFile, type PortalUploadBucket } from '@/lib/uploadPortalFile'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type FileUploadFieldProps = {
  label?: string
  value?: string
  onChange: (url: string) => void
  bucket?: PortalUploadBucket
  folder: string
  accept?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function FileUploadField({
  label,
  value,
  onChange,
  bucket = 'tenant-files',
  folder,
  accept = 'application/pdf,image/jpeg,image/png,image/webp',
  hint = 'PDF or image · max 10 MB',
  required = false,
  disabled = false,
  className,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  async function handleFile(file: File | null) {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be 10 MB or smaller')
      return
    }

    setError(null)
    setUploading(true)
    setProgress(0)

    try {
      const result = await uploadPortalFile(file, bucket, folder, setProgress)
      setFileName(result.fileName)
      onChange(result.publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function clear() {
    setFileName(null)
    onChange('')
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const hasFile = Boolean(value)

  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <label className="text-sm font-medium text-text-brown">
          {label}
          {required ? <span className="text-red-600"> *</span> : null}
        </label>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />

      {hasFile ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-[#d7c7b4]/60 bg-[#faf8f4] px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-brown">{fileName ?? 'File uploaded'}</p>
            <a href={value} target="_blank" rel="noreferrer" className="text-xs text-cta-brown underline">
              Preview
            </a>
          </div>
          <Button type="button" size="sm" variant="ghost" disabled={disabled || uploading} onClick={clear}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[#d7c7b4]/80 bg-white px-4 py-6 text-sm transition',
            'hover:border-cta-brown/40 hover:bg-[#faf8f4] disabled:cursor-not-allowed disabled:opacity-50',
          )}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading {progress}%
            </>
          ) : (
            <>
              <FileUp className="h-4 w-4 text-cta-brown" />
              Choose file to upload
            </>
          )}
        </button>
      )}

      {!hasFile && !uploading ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
