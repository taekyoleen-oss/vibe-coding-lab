'use client'

import { useState, useEffect } from 'react'
import { Mail, Send, CheckCircle, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ContentType } from '@/output/step2_types'

interface EditOwnerGateProps {
  contentType: ContentType
  contentId: string
  children: (isAuthenticated: boolean) => React.ReactNode
}

type GateState = 'idle' | 'sending' | 'sent' | 'authenticated' | 'error'

const OWNER_SESSION_KEY = (contentType: string, contentId: string) =>
  `owner_session_${contentType}_${contentId}`

export function EditOwnerGate({ contentType, contentId, children }: EditOwnerGateProps) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<GateState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 세션 쿠키 확인 (쿠키는 httpOnly이므로 서버 확인 불가, 로컬스토리지 보조)
  useEffect(() => {
    const key = OWNER_SESSION_KEY(contentType, contentId)
    const stored = sessionStorage.getItem(key)
    if (stored === 'true') {
      setIsAuthenticated(true)
      setState('authenticated')
    }
  }, [contentType, contentId])

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('올바른 이메일을 입력해주세요')
      return
    }
    setState('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), content_type: contentType, content_id: contentId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? '발송 실패')
      }
      setState('sent')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '발송에 실패했습니다.')
      setState('error')
    }
  }

  if (state === 'authenticated' || isAuthenticated) {
    return <>{children(true)}</>
  }

  if (state === 'sent') {
    return (
      <div className="rounded-lg border border-border bg-card p-4 space-y-2">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">수정 링크를 발송했습니다</span>
        </div>
        <p className="text-xs text-muted-foreground">
          <strong>{email}</strong>로 발송된 링크를 클릭하면 수정 권한이 활성화됩니다.
          링크는 15분간 유효합니다.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Lock className="h-4 w-4 shrink-0" />
        <p className="text-sm">
          수정하려면 등록 시 입력한 이메일로 소유권을 인증해야 합니다.
        </p>
      </div>

      <form onSubmit={handleSendLink} className="space-y-2">
        <Label className="text-xs">등록 시 입력한 이메일</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="pl-9 h-9 text-sm"
              disabled={state === 'sending'}
            />
          </div>
          <button
            type="submit"
            disabled={state === 'sending'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <Send className="h-3 w-3" />
            {state === 'sending' ? '발송 중...' : '링크 받기'}
          </button>
        </div>
        {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
      </form>
    </div>
  )
}
