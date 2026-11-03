import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Instrument_Sans, Instrument_Serif } from 'next/font/google'
import './globals.css'
import './xp.css'
import { ThemeProvider } from '@/components/theme-provider'
import { XpNav } from '@/components/xp/nav'
import { Ambient } from '@/components/xp/ambient'
import { ResumeDossier } from '@/components/xp/resume'
import { PortfolioInteractions } from '@/components/portfolio-interactions'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
})

const instrumentSans = Instrument_Sans({ subsets: ['latin'], variable: '--font-instrument-sans' })
const instrumentSerif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-instrument-serif' })

export const metadata: Metadata = {
  metadataBase: new URL('https://sairithwikreddy.vercel.app'),
  title: {
    default: 'Sai Rithwik Reddy Chirra — Engineering around data and AI',
    template: '%s — Sai Rithwik Reddy Chirra',
  },
  description: 'Rithwik works on APIs, databases, evaluations, and ML systems — the engineering around data and AI.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Sai Rithwik Reddy Chirra — Engineering around data and AI',
    description: 'APIs, databases, evaluations, and ML systems.',
    url: '/',
    siteName: 'Sai Rithwik Reddy Chirra',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sai Rithwik Reddy Chirra — Engineering around data and AI',
    description: 'APIs, databases, evaluations, and ML systems.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${instrumentSans.variable} ${instrumentSerif.variable} bg-background font-sans`}>
        <ThemeProvider
          attribute="class"
          storageKey="portfolio-theme-v3"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="site-shell relative flex min-h-screen flex-col">
            <Ambient />
            <XpNav />
            <div className="flex-1">{children}</div>
            <PortfolioInteractions />
            <ResumeDossier />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
