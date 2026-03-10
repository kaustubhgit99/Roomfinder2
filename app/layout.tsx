import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'RoomFinder — Find Your Perfect Home',
  description: 'Discover premium rooms and apartments. Connect with verified owners. Modern room finding platform.',
  keywords: 'room finder, apartments, PG, rent, housing',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
