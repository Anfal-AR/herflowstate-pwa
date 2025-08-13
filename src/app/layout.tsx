import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#ec4899',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://your-app-url.web.app'),
  title: {
    default: 'HerFlowState - Feminine Self-Care & Wellness',
    template: '%s | HerFlowState'
  },
  description: 'A modern, scientific, feminine self-care toolkit for tracking moods, goals, finances, and wellness.',
  keywords: ['self-care', 'wellness', 'mood tracker', 'goal tracker', 'feminine', 'health'],
  authors: [{ name: 'HerFlowState Team' }],
  creator: 'HerFlowState',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://herflowstate.web.app/',
    title: 'HerFlowState - Feminine Self-Care & Wellness',
    description: 'A modern, scientific, feminine self-care toolkit for tracking moods, goals, finances, and wellness.',
    siteName: 'HerFlowState',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HerFlowState - Feminine Self-Care & Wellness',
    description: 'A modern, scientific, feminine self-care toolkit for tracking moods, goals, finances, and wellness.',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HerFlowState',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={`font-sans bg-gradient-to-br from-primary-50 to-secondary-50 min-h-screen antialiased`}>
        <main className="relative">
          {children}
        </main>
      </body>
    </html>
  )
}