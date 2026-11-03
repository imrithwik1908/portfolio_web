import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Instrument_Sans, Instrument_Serif } from 'next/font/google'
import './globals.css'
import './xp.css'
import { ThemeProvider } from '@/components/theme-provider'
import { XpNav } from '@/components/xp/nav'
import { Ambient } from '@/components/xp/ambient'
import { PrintResume, ResumeDossier } from '@/components/xp/resume'

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
    default: 'Sai Rithwik Reddy Chirra — ML systems and the software around them',
    template: '%s — Sai Rithwik Reddy Chirra',
  },
  description: 'Rithwik builds machine learning systems and the software around them. M.S. CS at Arizona State, AAAI 2026 co-author, looking for ML engineering and data science roles.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Sai Rithwik Reddy Chirra',
    description: 'ML systems and the software around them. AAAI 2026. M.S. CS at Arizona State.',
    url: '/',
    siteName: 'Sai Rithwik Reddy Chirra',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sai Rithwik Reddy Chirra',
    description: 'ML systems and the software around them. AAAI 2026. M.S. CS at Arizona State.',
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
            <ResumeDossier />
            <PrintResume />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
