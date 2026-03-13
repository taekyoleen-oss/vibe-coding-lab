'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RefineAppInput, RefineAppResponse } from '@/output/step2_types'

interface AiRefineButtonProps {
  input: RefineAppInput
  onResult: (result: RefineAppResponse) => void
  className?: string
}

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export function AiRefineButton({ input, onResult, className }: AiRefineButtonProps) {
  const { data: aiStatus } = useSWR<{ enabled: boolean }>('/api/ai/status', fetcher)
  const [loading, setLoading] = useState(false)

  const isEnabled = aiStatus?.enabled === true

  async function handleRefine() {
    if (!isEnabled || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('AI 요청 실패')
      const data: RefineAppResponse = await res.json()
      onResult(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleRefine}
      disabled={!isEnabled || loading}
      title={!isEnabled ? '현재 관리자에 의해 비활성화됨' : 'AI로 설명을 다듬어드립니다'}
      className={cn(
        'inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-colors font-medium',
        isEnabled && !loading
          ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
          : 'opacity-50 cursor-not-allowed border-border bg-muted text-muted-foreground',
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {loading ? 'AI가 다듬는 중...' : 'AI가 수정하기'}
    </button>
  )
}
