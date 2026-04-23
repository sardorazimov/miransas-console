import type { Metadata } from 'next'
import { Space_Grotesk, Fira_Code } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

// Modern, teknolojik ve keskin arayüz fontu
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

// Geliştiricilerin favorisi, pro terminal fontu
const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'miransas console',
  description: 'miransas management console',
  icons: '/logo.tsx',
  // Next.js app/icon.tsx veya app/favicon.ico dosyasını otomatik algılar.
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${firaCode.variable}`}>
      <body 
        className="min-h-screen bg-[#050505] text-white antialiased selection:bg-[#8CFF2E] selection:text-black"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}