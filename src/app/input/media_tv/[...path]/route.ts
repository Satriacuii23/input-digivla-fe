import { serveMediaFromFolder } from '@/lib/storage/serve-media-file'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path: filePathParts } = await params
    return serveMediaFromFolder('media_tv', filePathParts)
  } catch (error) {
    console.error('Video serving error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
