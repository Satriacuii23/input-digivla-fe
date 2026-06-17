import {
  getMediaFileSizeLimitError,
  isMediaFileWithinSizeLimit,
} from '@/lib/storage/media-upload-limits'
import type { MediaKind } from '@/lib/storage/media-paths'

export type MediaUploadClientResult =
  | { success: true; dbPath: string }
  | { success: false; error: string }

export async function uploadMediaVideoFile(
  kind: MediaKind,
  videoFile: File,
  uploadDate: Date | null,
  mediaId: string,
): Promise<MediaUploadClientResult> {
  if (!isMediaFileWithinSizeLimit(videoFile.size)) {
    return { success: false, error: getMediaFileSizeLimitError() }
  }

  const d = uploadDate || new Date()
  const formData = new FormData()
  formData.append('file', videoFile)
  formData.append('year', String(d.getFullYear()))
  formData.append('month', String(d.getMonth() + 1).padStart(2, '0'))
  formData.append('day', String(d.getDate()).padStart(2, '0'))
  formData.append('mediaTypeId', kind === 'tv' ? '012' : '013')
  formData.append('mediaId', String(mediaId).padStart(4, '0'))

  const res = await fetch(`/api/upload/${kind}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return {
      success: false,
      error: typeof data.error === 'string' ? data.error : 'Failed to upload media file',
    }
  }

  return { success: true, dbPath: data.dbPath ?? '' }
}
