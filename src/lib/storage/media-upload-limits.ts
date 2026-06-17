/** Max MP4 upload size for TV/Radio (must match next.config experimental body limits). */
export const MAX_MEDIA_UPLOAD_BYTES = 200 * 1024 * 1024

export const MAX_MEDIA_UPLOAD_MB = 200

export const MAX_MEDIA_UPLOAD_LABEL = '200 MB'

export function isMediaFileWithinSizeLimit(size: number): boolean {
  return size > 0 && size <= MAX_MEDIA_UPLOAD_BYTES
}

export function getMediaFileSizeLimitError(): string {
  return `File exceeds maximum size of ${MAX_MEDIA_UPLOAD_LABEL}. Please choose a smaller MP4 file.`
}
