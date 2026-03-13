'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NicknameInput } from '@/components/common/NicknameInput'
import { MarkdownEditor } from '@/components/common/MarkdownEditor'
import type { CreateRequestInput, RequestType } from '@/output/step2_types'

const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  general: '일반 문의',
  app_feedback: '앱 피드백',
  app_error: '오류 신고',
  app_update: '업데이트 요청',
}

interface RequestSubmitFormProps {
  defaultLinkedAppId?: string
}

export function RequestSubmitForm({ defaultLinkedAppId }: RequestSubmitFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<Partial<CreateRequestInput>>({
    title: '',
    content: '',
    request_type: 'general',
    linked_app_id: defaultLinkedAppId ?? '',
    author_nickname: '',
    author_email: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.title?.trim()) errs.title = '제목을 입력해주세요'
    if (!form.content?.trim()) errs.content = '내용을 입력해주세요'
    if (!form.author_nickname?.trim()) errs.author_nickname = '닉네임을 입력해주세요'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    try {
      const payload: CreateRequestInput = {
        title: form.title!,
        content: form.content!,
        request_type: form.request_type ?? 'general',
        author_nickname: form.author_nickname!,
        ...(form.linked_app_id?.trim() ? { linked_app_id: form.linked_app_id } : {}),
        ...(form.author_email?.trim() ? { author_email: form.author_email } : {}),
      }

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? '요청 제출 실패')
      }

      const { data } = await res.json()
      router.push(`/requests/${data.id}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : '요청 제출에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* 안내 */}
      <div className="flex items-start gap-2 rounded-md bg-blue-50 dark:bg-blue-950/50 p-3 text-sm text-blue-800 dark:text-blue-200">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          개발 요청은 비개발자가 만든 앱에 대한 피드백, 수정 요청, 오류 신고 등입니다.
          운영 관련 문의는 <a href="/contact" className="underline">문의하기</a> 페이지를 이용해 주세요.
        </span>
      </div>

      {/* 요청 유형 */}
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

      {/* 제목 */}
      <div className="space-y-1.5">
        <Label>
          제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="요청 제목을 입력하세요"
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
      </div>

      {/* 내용 */}
      <div className="space-y-1.5">
        <Label>
          내용 <span className="text-destructive">*</span>
        </Label>
        <MarkdownEditor
          value={form.content ?? ''}
          onChange={(v) => setForm((p) => ({ ...p, content: v }))}
          placeholder="요청 내용을 자세히 작성해 주세요"
          height={250}
        />
        {errors.content && <p className="text-xs text-destructive">{errors.content}</p>}
      </div>

      {/* 연결 앱 ID (선택) */}
      <div className="space-y-1.5">
        <Label>연결할 앱 ID (선택)</Label>
        <Input
          value={form.linked_app_id ?? ''}
          onChange={(e) => setForm((p) => ({ ...p, linked_app_id: e.target.value }))}
          placeholder="특정 앱과 연결하려면 앱 ID를 입력하세요"
        />
      </div>

      {/* 닉네임 */}
      <NicknameInput
        value={form.author_nickname ?? ''}
        onChange={(v) => setForm((p) => ({ ...p, author_nickname: v }))}
        required
        error={errors.author_nickname}
      />

      {/* 이메일 */}
      <div className="space-y-1.5">
        <Label>이메일 (선택)</Label>
        <Input
          type="email"
          value={form.author_email ?? ''}
          onChange={(e) => setForm((p) => ({ ...p, author_email: e.target.value }))}
          placeholder="답변을 받을 이메일 (공개되지 않습니다)"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-sm py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {submitting ? '제출 중...' : '요청 등록하기'}
      </button>
    </form>
  )
}
