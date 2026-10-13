import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteHeader } from '@/components/site-header'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Sai Rithwik Reddy Chirra | Software, Data & AI',
  description: 'Rithwik is an MS Computer Science student at Arizona State University working across backend systems, data, and machine learning.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-background font-sans`}>
        <ThemeProvider
          attribute="class"
          storageKey="portfolio-theme-v3"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="site-shell terminal-surface relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
