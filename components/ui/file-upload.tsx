'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileAudio, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onUpload: (file: File) => void
  onUploadComplete?: (result: any) => void
  className?: string
}

export function FileUpload({ onUpload, onUploadComplete, className }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      // Call parent upload handler
      onUpload(file)

      // Upload to API
      const formData = new FormData()
      formData.append('meeting', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      setSuccess(`Uploaded ${file.name} successfully`)
      onUploadComplete?.(result)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [onUpload, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.webm', '.ogg'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv']
    },
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: false
  })

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          uploading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-blue-600 font-medium">Uploading...</p>
            </>
          ) : (
            <>
              {isDragActive ? (
                <Upload className="h-12 w-12 text-blue-600" />
              ) : (
                <FileAudio className="h-12 w-12 text-gray-400" />
              )}
              
              <div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {isDragActive ? 'Drop your meeting recording here' : 'Upload meeting recording'}
                </p>
                <p className="text-sm text-gray-500">
                  Supports MP3, WAV, MP4, WebM and more • Max 500MB
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Works with recordings from any platform: Zoom, Teams, Meet, Discord, etc.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}
    </div>
  )
}