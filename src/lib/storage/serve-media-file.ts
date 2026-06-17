import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import { resolveMediaDiskPaths } from './media-paths'

const CONTENT_TYPES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
}

export async function serveMediaFromFolder(
  folder: 'media_tv' | 'media_radio',
  pathParts: string[],
) {
  const candidates = resolveMediaDiskPaths(folder, pathParts)
  const diskPath = candidates.find((candidate) => existsSync(candidate))

  if (!diskPath) {
    return new NextResponse('File not found', { status: 404 })
  }

  const file = await readFile(diskPath)
  const ext = path.extname(diskPath).toLowerCase()

  return new NextResponse(file, {
    headers: {
      'Content-Type': CONTENT_TYPES[ext] || 'application/octet-stream',
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=31536000',
    },
  })
}
