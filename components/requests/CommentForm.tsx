'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { CreateCommentInput } from '@/output/step2_types'

interface CommentFormProps {
  postId: string
  parentId?: string
  depth?: number
  placeholder?: string
  onSuccess: () => void
  onCancel?: () => void
}

export function CommentForm({
  postId,
  parentId,
  depth = 0,
  placeholder = '댓글을 입력해주세요',
  onSuccess,
  onCancel,
}: CommentFormProps) {
  const [form, setForm] = useState({
    author_nickname: '',
    author_email: '',
    content: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.author_nickname.trim()) errs.author_nickname = '닉네임을 입력해주세요'
    if (!form.content.trim()) errs.content = '내용을 입력해주세요'
    if (form.author_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.author_email)) {
      errs.author_email = '올바른 이메일 형식으로 입력해주세요'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    try {
      const payload: CreateCommentInput = {
        post_id: postId,
        content: form.content.trim(),
        author_nickname: form.author_nickname.trim(),
        ...(parentId ? { parent_id: parentId } : {}),
        ...(form.author_email.trim() ? { author_email: form.author_email.trim() } : {}),
      }

      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? '댓글 등록 실패')
      }

      setForm({ author_nickname: '', author_email: '', content: '' })
      onSuccess()
    } catch (err) {
      alert(err instanceof Error ? err.message : '댓글 등록에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-3 ${depth > 0 ? 'bg-muted/30 rounded-lg p-3' : ''}`}
    >
      <div className="flex gap-3">
        <div className="flex-1 space-y-1">
          <Label className="text-xs">닉네임 *</Label>
          <Input
            value={form.author_nickname}
            onChange={(e) => setForm((p) => ({ ...p, author_nickname: e.target.value }))}
            placeholder="닉네임"
            className="h-8 text-sm"
          />
          {errors.author_nickname && (
            <p className="text-xs text-destructive">{errors.author_nickname}</p>
          )}
        </div>
        <div className="flex-1 space-y-1">
          <Label className="text-xs">이메일 (선택)</Label>
          <Input
            type="email"
            value={form.author_email}
            onChange={(e) => setForm((p) => ({ ...p, author_email: e.target.value }))}
            placeholder="이메일 (공개되지 않음)"
            className="h-8 text-sm"
          />
          {errors.author_email && (
            <p className="text-xs text-destructive">{errors.author_email}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Textarea
          value={form.content}
          onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
          placeholder={placeholder}
          rows={depth > 0 ? 2 : 3}
          className="text-sm resize-none"
        />
        {errors.content && <p className="text-xs text-destructive">{errors.content}</p>}
      </div>

      <div className="flex items-center gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="text-xs px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {submitting ? '등록 중...' : depth > 0 ? '답글 등록' : '댓글 등록'}
        </button>
      </div>
    </form>
  )
}
