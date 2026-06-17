/** Derive article title from the video file name (without extension). */
export function getTitleFromVideoFileName(fileName: string): string {
  const baseName = fileName.replace(/\.[^.]+$/i, '').trim()
  if (!baseName) return ''

  return baseName
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Read MP4/video duration in seconds from a local File (browser metadata). */
export async function getVideoDurationSeconds(file: File): Promise<number | null> {
  const isVideo =
    file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4')
  if (!isVideo) return null

  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    const objectUrl = URL.createObjectURL(file)

    const cleanup = () => {
      video.removeAttribute('src')
      video.load()
      URL.revokeObjectURL(objectUrl)
    }

    video.onloadedmetadata = () => {
      const raw = video.duration
      cleanup()
      if (!Number.isFinite(raw) || raw <= 0) {
        resolve(null)
        return
      }
      resolve(Math.round(raw))
    }

    video.onerror = () => {
      cleanup()
      resolve(null)
    }

    video.src = objectUrl
  })
}

export interface VideoUploadMetadata {
  title: string
  duration: number | null
}

/** Title from file name + duration from video metadata. */
export async function getVideoUploadMetadata(file: File): Promise<VideoUploadMetadata> {
  const duration = await getVideoDurationSeconds(file)
  return {
    title: getTitleFromVideoFileName(file.name),
    duration,
  }
}
