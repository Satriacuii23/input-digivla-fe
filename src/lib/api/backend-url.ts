/**
 * Backend API base URL for Next.js BFF routes (server-side only).
 * Use 127.0.0.1 — on Windows, "localhost" may resolve to ::1 and hang/time out.
 */
function normalizeBackendUrl(url: string): string {
  return url.replace(/\/\/localhost\b/gi, '//127.0.0.1')
}

const rawBackendUrl =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://192.168.100.50:8005'

export const BACKEND_API_URL = normalizeBackendUrl(rawBackendUrl)

/** Fetch helper for BFF → FastAPI with sane timeout. */
export async function backendFetch(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<Response> {
  const { timeoutMs = 8000, ...fetchInit } = init ?? {}
  const url = path.startsWith('http') ? path : `${BACKEND_API_URL}${path}`

  return fetch(url, {
    ...fetchInit,
    cache: 'no-store',
    signal: AbortSignal.timeout(timeoutMs),
  })
}
