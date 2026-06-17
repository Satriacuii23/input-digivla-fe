'use client'

import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export default function ForbiddenPage() {
  return (
    <div className="digivla-forbidden-page">
      <div className="digivla-forbidden-card">
        <ShieldAlert size={48} strokeWidth={1.5} aria-hidden />
        <h1>Akses Ditolak</h1>
        <p>Akun Anda tidak memiliki izin untuk membuka halaman ini.</p>
        <Link href="/dashboard" className="digivla-forbidden-link">
          Kembali ke halaman utama
        </Link>
      </div>
    </div>
  )
}
