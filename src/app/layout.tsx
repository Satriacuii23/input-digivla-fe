import type { Metadata } from 'next'
import './globals.css'
import { AntdProvider } from '@/components/providers/antd-provider'

export const metadata: Metadata = {
  title: 'Digivla IDS - Media Operations',
  description: 'Media monitoring and content management system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AntdProvider>{children}</AntdProvider>
      </body>
    </html>
  )
}
