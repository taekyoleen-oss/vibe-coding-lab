'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NicknameInput } from '@/components/common/NicknameInput'
import type { CreateRequestInput, RequestType } from '@/output/step2_types'

interface AppRequestFormProps {
  appId: string
  appTitle: string
  onSuccess?: () => void
}

const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  general: '일반 문의',
  app_feedback: '앱 피드백',
  app_error: '오류 신고',
  app_update: '업데이트 요청',
}

export function AppRequestForm({ appId, appTitle, onSuccess }: AppRequestFormProps) {
  const [form, setForm] = useState<Partial<CreateRequestInput>>({
    title: '',
    content: '',
    request_type: 'app_feedback',
    linked_app_id: appId,
    author_nickname: '',
    author_email: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title?.trim() || !form.content?.trim() || !form.author_nickname?.trim()) {
      setError('제목, 내용, 닉네임은 필수입니다.')
      return
    }
    setSubmitting(true)
    setError(null)

    try {
      const payload: CreateRequestInput = {
        title: form.title!,
        content: form.content!,
        request_type: form.request_type ?? 'app_feedback',
        linked_app_id: appId,
        author_nickname: form.author_nickname!,
        ...(form.author_email?.trim() ? { author_email: form.author_email } : {}),
      }

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? '요청 실패')
      }

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : '요청에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border bg-card p-4 space-y-4"
    >
      <p className="text-sm font-medium text-foreground">
        「{appTitle}」에 요청하기
      </p>

      <div className="space-y-1.5">
        <Label>요청 유형</Label>
        <Select
          value={form.request_type}
          onValueChange={(v) => setForm((p) => ({ ...p, request_type: v as RequestType }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(REQUEST_TYPE_LABELS) as [RequestType, string][]).map(([val, label]) => (
              <SelectItem key={val} value={val}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>
          제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="요청 제목"
        />
      </div>

      <div className="space-y-1.5">
        <Label>
          내용 <span className="text-destructive">*</span>
        </Label>
        <Textarea
          value={form.content}
          onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
          placeholder="요청 내용을 입력하세요"
          rows={4}
        />
      </div>

      <NicknameInput
        value={form.author_nickname ?? ''}
        onChange={(v) => setForm((p) => ({ ...p, author_nickname: v }))}
        required
      />

      <div className="space-y-1.5">
        <Label>이메일 (선택)</Label>
        <Input
          type="email"
          value={form.author_email ?? ''}
          onChange={(e) => setForm((p) => ({ ...p, author_email: e.target.value }))}
          placeholder="답변 받을 이메일 (선택)"
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2 justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {submitting ? '제출 중...' : '요청 제출'}
        </button>
      </div>
    </form>
  )
}
