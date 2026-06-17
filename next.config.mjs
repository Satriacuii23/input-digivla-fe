import os from 'os'

/** IPv4 LAN addresses for Next.js dev cross-origin (allowedDevOrigins). */
function getAllowedDevOrigins() {
  const origins = new Set(['localhost', '127.0.0.1'])

  for (const value of (process.env.LAN_ALLOWED_ORIGINS || '').split(',')) {
    const host = value.trim()
    if (host) origins.add(host)
  }

  for (const ifaces of Object.values(os.networkInterfaces())) {
    if (!ifaces) continue
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        origins.add(iface.address)
      }
    }
  }

  return [...origins]
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    API_URL: process.env.API_URL || 'http://192.168.100.50:8005',
  },
  allowedDevOrigins: getAllowedDevOrigins(),
  experimental: {
    serverActions: {
      bodySizeLimit: '200mb',
    },
    /** Must match MAX_MEDIA_UPLOAD_BYTES (200 MB) in lib/storage/media-upload-limits.ts */
    middlewareClientMaxBodySize: '200mb',
  },
}

export default nextConfig
