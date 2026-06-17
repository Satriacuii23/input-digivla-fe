/** Client-safe helpers — maps DB `filee` path to public URL. */

export function fileeToPublicUrl(filee: string | null | undefined): string | null {
  if (!filee) return null
  if (filee.startsWith('tv_files/')) {
    return `/input/media_tv/${filee.slice('tv_files/'.length)}`
  }
  if (filee.startsWith('radio_files/')) {
    return `/input/media_radio/${filee.slice('radio_files/'.length)}`
  }
  return null
}
