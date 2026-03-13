'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

type VerifyStatus = 'loading' | 'success' | 'expired' | 'used' | 'invalid' | 'error'

interface VerifyTokenClientProps {
  token?: string
  type?: string
  id?: string
}

const TYPE_LABELS: Record<string, string> = {
  app: '앱',
  request: '개발요청',
  info: '정보 공유',
  link: '참고 링크',
}

const TYPE_PATHS: Record<string, string> = {
  app: '/apps',
  request: '/requests',
  info: '/info',
  link: '/links',
}

export function VerifyTokenClient({ token, type, id }: VerifyTokenClientProps) {
  const [status, setStatus] = useState<VerifyStatus>('loading')

  useEffect(() => {
    if (!token || !type || !id) {
      setStatus('invalid')
      return
    }

    async function verify() {
      try {
        const res = await fetch(
          `/api/auth/verify?token=${encodeURIComponent(token!)}&type=${type}&id=${id}`
        )
        const json = await res.json()

        if (res.ok) {
          // 세션 스토리지에도 기록 (EditOwnerGate에서 읽음)
          sessionStorage.setItem(`owner_session_${type}_${id}`, 'true')
          setStatus('success')
        } else if (json.code === 'TOKEN_EXPIRED') {
          setStatus('expired')
        } else if (json.code === 'TOKEN_USED') {
          setStatus('used')
        } else {
          setStatus('invalid')
        }
      } catch {
        setStatus('error')
      }
    }

    verify()
  }, [token, type, id])

  const contentPath = type && id ? `${TYPE_PATHS[type] ?? ''}/${id}` : '/'
  const contentLabel = type ? TYPE_LABELS[type] ?? '콘텐츠' : '콘텐츠'

  if (status === 'loading') {
    return (
      <div className="space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">인증 확인 중...</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="space-y-4">
        <CheckCircle className="h-14 w-14 text-green-500 mx-auto" />
        <h1 className="text-xl font-bold text-foreground">소유권이 인증되었습니다</h1>
        <p className="text-sm text-muted-foreground">
          30분간 {contentLabel} 수정 권한이 활성화됩니다.
        </p>
        <Link
          href={contentPath}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          {contentLabel} 수정하러 가기
        </Link>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="space-y-4">
        <Clock className="h-14 w-14 text-amber-500 mx-auto" />
        <h1 className="text-xl font-bold text-foreground">링크가 만료되었습니다</h1>
        <p className="text-sm text-muted-foreground">
          수정 링크는 발급 후 15분간 유효합니다. 다시 요청해 주세요.
        </p>
        <Link
          href={contentPath}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent/50 transition-colors"
        >
          돌아가기
        </Link>
      </div>
    )
  }

  if (status === 'used') {
    return (
      <div className="space-y-4">
        <XCircle className="h-14 w-14 text-muted-foreground mx-auto" />
        <h1 className="text-xl font-bold text-foreground">이미 사용된 링크입니다</h1>
        <p className="text-sm text-muted-foreground">
          이 인증 링크는 이미 사용되었습니다. 수정이 필요하면 다시 요청해 주세요.
        </p>
        <Link
          href={contentPath}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent/50 transition-colors"
        >
          돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <XCircle className="h-14 w-14 text-destructive mx-auto" />
      <h1 className="text-xl font-bold text-foreground">인증에 실패했습니다</h1>
      <p className="text-sm text-muted-foreground">
        유효하지 않은 링크입니다. 다시 시도하거나 관리자에게 문의해 주세요.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent/50 transition-colors"
      >
        홈으로
      </Link>
    </div>
  )
}
