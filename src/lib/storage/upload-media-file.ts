import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { buildUploadPaths, MediaKind } from './media-paths'
import { getMediaFileSizeLimitError, isMediaFileWithinSizeLimit } from './media-upload-limits'

export async function saveMediaUpload(
  kind: MediaKind,
  file: File,
  year: string,
  month: string,
  day: string,
  mediaTypeId: string,
  mediaId: string,
) {
  if (!isMediaFileWithinSizeLimit(file.size)) {
    throw new Error(getMediaFileSizeLimitError())
  }

  const uniqueCode = Date.now()
  const fileName = `${year}-${month}-${day}-${mediaTypeId}-${mediaId}-${uniqueCode}.mp4`
  const { diskDir, diskFilePath, dbPath, publicPath } = buildUploadPaths({
    kind,
    year,
    month,
    day,
    fileName,
  })

  if (!existsSync(diskDir)) {
    await mkdir(diskDir, { recursive: true })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(diskFilePath, buffer)

  return { fileName, dbPath, publicPath }
}
