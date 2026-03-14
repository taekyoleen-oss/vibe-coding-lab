import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Source_Serif_4, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'
import { AnnouncementBanner } from '@/components/layout/AnnouncementBanner'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { MobileNavOverlay } from '@/components/layout/MobileNavOverlay'
import { MobileUserButton } from '@/components/auth/MobileUserButton'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const serif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '비개발자의 개발실',
  description: '비개발자가 AI로 만든 앱과 개발 경험을 공유하는 공간입니다.',
  openGraph: {
    title: '비개발자의 개발실',
    description: '비개발자가 AI로 만든 앱과 개발 경험을 공유하는 공간입니다.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${jakarta.variable} ${serif.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AnnouncementBanner />
          <div className="flex min-h-screen">
            {/* 데스크탑 사이드바 */}
            <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-border bg-sidebar">
              <AppSidebar />
            </aside>
            {/* 메인 콘텐츠 */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* 모바일 헤더 */}
              <header className="md:hidden flex items-center h-14 px-4 border-b border-border bg-background sticky top-0 z-40">
                <MobileNavOverlay />
                <span className="ml-3 font-semibold text-sm text-foreground flex-1">
                  비개발자의 개발실
                </span>
                <MobileUserButton />
              </header>
              <main className="flex-1">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
