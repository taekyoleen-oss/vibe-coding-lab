'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, MessageSquare, BookOpen, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DarkModeToggle } from './DarkModeToggle'

const NAV_ITEMS = [
  { href: '/', label: '홈', icon: <Home className="h-4 w-4" /> },
  { href: '/apps', label: '개발앱', icon: <LayoutGrid className="h-4 w-4" /> },
  { href: '/requests', label: '개발요청', icon: <MessageSquare className="h-4 w-4" /> },
  { href: '/info', label: '정보공유', icon: <BookOpen className="h-4 w-4" /> },
  { href: '/links', label: '참고링크', icon: <Link2 className="h-4 w-4" /> },
]

export function AppSidebar() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex flex-col h-full py-4">
      {/* 로고 / 사이트명 */}
      <div className="px-4 mb-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-base font-bold text-foreground leading-tight">
            비개발자의<br />개발실
          </span>
        </Link>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
              isActive(item.href)
                ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* 하단: 다크모드 토글 */}
      <div className="px-3 pt-4 border-t border-border mt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">테마</span>
          <DarkModeToggle />
        </div>
      </div>
    </div>
  )
}
