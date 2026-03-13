'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Home, LayoutGrid, MessageSquare, BookOpen, Link2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { DarkModeToggle } from './DarkModeToggle'

const NAV_ITEMS = [
  { href: '/', label: '홈', icon: <Home className="h-4 w-4" /> },
  { href: '/apps', label: '개발앱', icon: <LayoutGrid className="h-4 w-4" /> },
  { href: '/requests', label: '개발요청', icon: <MessageSquare className="h-4 w-4" /> },
  { href: '/info', label: '정보공유', icon: <BookOpen className="h-4 w-4" /> },
  { href: '/links', label: '참고링크', icon: <Link2 className="h-4 w-4" /> },
]

export function MobileNavOverlay() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        aria-label="메뉴 열기"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="px-4 py-4 border-b border-border">
          <SheetTitle className="text-left text-base font-bold">
            비개발자의 개발실
          </SheetTitle>
        </SheetHeader>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
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
        <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">테마</span>
            <DarkModeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
