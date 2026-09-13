import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'AI Prompt Generator — Create Powerful AI Prompts in Seconds',
  description: 'Free AI Prompt Generator. Turn your ideas into structured, optimized prompts for Midjourney, Flux, DALL·E, Cursor AI, ChatGPT, and more. Multi-language support, specialized templates for image generation and code development.',
  keywords: ['AI prompt generator', 'prompt builder', 'Midjourney prompt', 'Flux prompt', 'Cursor AI prompt', 'DALL·E prompt', 'ChatGPT prompt', 'prompt engineering', 'AI art prompt', 'code prompt generator'],
  authors: [{ name: 'AI Prompt Generator' }],
  creator: 'AI Prompt Generator',
  publisher: 'AI Prompt Generator',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  alternates: {
    canonical: '/',
    languages: { 'en': '/', 'ar': '/', 'fr': '/', 'es': '/' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['ar_SA', 'fr_FR', 'es_ES'],
    url: '/',
    siteName: 'AI Prompt Generator',
    title: 'AI Prompt Generator — Create Powerful AI Prompts in Seconds',
    description: 'Turn your ideas into structured, optimized prompts for Midjourney, Flux, Cursor AI, ChatGPT, and more. Free, multi-language, with specialized templates.',
    images: [{ url: '/images/product.png', width: 1200, height: 630, alt: 'AI Prompt Generator' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Prompt Generator — Create Powerful AI Prompts in Seconds',
    description: 'Turn your ideas into structured, optimized prompts for Midjourney, Flux, Cursor AI, ChatGPT, and more.',
    images: ['/images/product.png'],
  },
  icons: { icon: { url: '/icon.svg', type: 'image/svg+xml' } },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0d12',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
