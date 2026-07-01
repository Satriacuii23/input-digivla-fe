/** Derive article title from the video file name (without extension). */
export function getTitleFromVideoFileName(fileName: string): string {
  const parsed = parseVideoFileNameFields(fileName)
  return parsed.title
}

/**
 * Parse optional broadcast time (HH:mm) from a trailing `-HHmm` suffix before the extension.
 * Example: "Prabowo Anggarkan Program MBG-1120.mp4" → title + time "11:20"
 */
export function parseVideoFileNameFields(fileName: string): {
  title: string
  time: string | null
} {
  const baseName = fileName.replace(/\.[^.]+$/i, '').trim()
  if (!baseName) return { title: '', time: null }

  const timeSuffixMatch = baseName.match(/^(.+)-(\d{4})$/)
  if (timeSuffixMatch) {
    const [, rawTitle, hhmm] = timeSuffixMatch
    const hours = parseInt(hhmm.slice(0, 2), 10)
    const minutes = parseInt(hhmm.slice(2, 4), 10)
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      const title = rawTitle
        .replace(/_+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      return { title, time }
    }
  }

  const title = baseName
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return { title, time: null }
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
  time: string | null
}

/** Title & optional time from file name + duration from video metadata. */
export async function getVideoUploadMetadata(file: File): Promise<VideoUploadMetadata> {
  const { title, time } = parseVideoFileNameFields(file.name)
  const duration = await getVideoDurationSeconds(file)
  return {
    title,
    duration,
    time,
  }
}
