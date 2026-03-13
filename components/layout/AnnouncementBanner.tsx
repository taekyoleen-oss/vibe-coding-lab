'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const SESSION_KEY = 'announcement_dismissed'
const DEFAULT_MESSAGE =
  '이 공간은 비개발자가 앱을 개발하는 데 도움을 주고 경험을 나누는 공간입니다. 닉네임은 신원 확인 수단이 아닙니다.'

interface AnnouncementBannerProps {
  message?: string
}

export function AnnouncementBanner({ message }: AnnouncementBannerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = sessionStorage.getItem(SESSION_KEY)
    if (!dismissed) {
      setVisible(true)
    }
  }, [])

  function handleDismiss() {
    sessionStorage.setItem(SESSION_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 relative">
      <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm pr-8">
        {message ?? DEFAULT_MESSAGE}
      </AlertDescription>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
        aria-label="배너 닫기"
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  )
}
