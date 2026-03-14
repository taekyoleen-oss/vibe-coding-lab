'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import type { ContentType } from '@/output/step2_types'

interface EditOwnerGateProps {
  contentType: ContentType
  contentId: string
  /** DB에 저장된 author_id — null이면 익명 등록(관리자만 수정 가능) */
  authorId?: string | null
  children: React.ReactNode
}

/**
 * 로그인된 사용자 ID === authorId(또는 관리자)인 경우에만 children 렌더
 */
export function EditOwnerGate({ contentId: _contentId, authorId, children }: EditOwnerGateProps) {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'owner' | 'not-owner' | 'not-logged-in'>('loading')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user
      if (!user) {
        setStatus('not-logged-in')
        return
      }
      const isAdmin = user.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID
      const isOwner = !!(authorId && user.id === authorId)
      setStatus(isAdmin || isOwner ? 'owner' : 'not-owner')
    })
  }, [supabase, authorId])

  if (status === 'loading') return null

  if (status === 'not-logged-in') {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-center space-y-3">
        <p className="text-sm text-muted-foreground">이 게시물을 수정하려면 로그인이 필요합니다.</p>
        <button
          onClick={() => router.push(`/auth/login?next=${encodeURIComponent(window.location.pathname)}`)}
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium px-4 py-2 hover:bg-primary/90 transition-colors"
        >
          로그인하기
        </button>
      </div>
    )
  }

  if (status === 'not-owner') return null

  return <>{children}</>
}
