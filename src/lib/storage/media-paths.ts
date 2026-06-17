import path from 'path'

export const DEFAULT_SYNOLOGY_ROOT = 'C:\\Tools\\Project\\synology-disk'

export type MediaKind = 'tv' | 'radio'

export function getSynologyRoot(): string {
  return process.env.SYNOLOGY_DISK_ROOT || DEFAULT_SYNOLOGY_ROOT
}

export function buildUploadPaths(options: {
  kind: MediaKind
  year: string
  month: string
  day: string
  fileName: string
}) {
  const folder = options.kind === 'tv' ? 'media_tv' : 'media_radio'
  const dbPrefix = options.kind === 'tv' ? 'tv_files' : 'radio_files'
  const diskDir = path.join(
    getSynologyRoot(),
    'input',
    folder,
    options.year,
    options.month,
    options.day,
  )
  const diskFilePath = path.join(diskDir, options.fileName)
  const dbPath = `${dbPrefix}/${options.year}/${options.month}/${options.day}/${options.fileName}`
  const publicPath = `/input/${folder}/${options.year}/${options.month}/${options.day}/${options.fileName}`

  return { diskDir, diskFilePath, dbPath, publicPath, folder }
}

/** Synology path first, then legacy Frontend/V2/input for existing files. */
export function resolveMediaDiskPaths(
  folder: 'media_tv' | 'media_radio',
  pathParts: string[],
): string[] {
  return [
    path.join(getSynologyRoot(), 'input', folder, ...pathParts),
    path.join(process.cwd(), 'input', folder, ...pathParts),
  ]
}
