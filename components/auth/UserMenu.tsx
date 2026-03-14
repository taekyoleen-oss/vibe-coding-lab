'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { LogIn, LogOut, User as UserIcon } from 'lucide-react'

export function UserMenu() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const nickname = user?.user_metadata?.nickname ?? user?.email?.split('@')[0] ?? '사용자'

  if (!user) {
    const loginHref = `/auth/login?next=${encodeURIComponent(pathname)}`
    return (
      <Link
        href={loginHref}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors w-full"
      >
        <LogIn className="h-4 w-4" />
        로그인
      </Link>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-foreground hover:bg-accent/50 transition-colors w-full"
      >
        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
          {nickname.charAt(0).toUpperCase()}
        </div>
        <span className="truncate flex-1 text-left">{nickname}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 right-0 mb-1 z-20 rounded-lg border border-border bg-popover shadow-lg py-1">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs font-medium text-foreground truncate">{nickname}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  )
}
