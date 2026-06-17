import { NextResponse } from 'next/server'
import { saveMediaUpload } from '@/lib/storage/upload-media-file'
import { getMediaFileSizeLimitError, isMediaFileWithinSizeLimit } from '@/lib/storage/media-upload-limits'

export async function POST(request: Request) {
  try {
    const cookies = request.headers.get('cookie') || ''
    if (!cookies.includes('auth-token=')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!isMediaFileWithinSizeLimit(file.size)) {
      return NextResponse.json({ error: getMediaFileSizeLimitError() }, { status: 413 })
    }

    const now = new Date()
    const year = (formData.get('year') as string) || now.getFullYear().toString()
    const month =
      (formData.get('month') as string) || String(now.getMonth() + 1).padStart(2, '0')
    const day = (formData.get('day') as string) || String(now.getDate()).padStart(2, '0')
    const mediaTypeId = (formData.get('mediaTypeId') as string) || '012'
    const mediaId = (formData.get('mediaId') as string) || '0000'

    const result = await saveMediaUpload('tv', file, year, month, day, mediaTypeId, mediaId)

    return NextResponse.json({
      success: true,
      fileName: result.fileName,
      dbPath: result.dbPath,
      fullPath: result.publicPath,
    })
  } catch (error) {
    console.error('Video upload error:', error)
    const message =
      error instanceof Error ? error.message : 'Unknown upload error'
    return NextResponse.json(
      { error: `Failed to upload video: ${message}` },
      { status: 500 },
    )
  }
}
