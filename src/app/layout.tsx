import type { Metadata, Viewport } from 'next'
import { Noto_Sans_TC } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const notoSansTC = Noto_Sans_TC({
  variable: '--font-noto-sans-tc',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: '選民服務管理系統',
  description: '民代辦公室選民服務 CRM 系統',
  manifest: '/manifest.json'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f172a'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className={`${notoSansTC.variable} font-sans antialiased bg-slate-900 text-slate-100`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
