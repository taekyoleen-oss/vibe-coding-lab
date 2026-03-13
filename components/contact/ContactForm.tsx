'use client'

import { useState } from 'react'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export function ContactForm() {
  const [form, setForm] = useState({
    subject: '',
    message: '',
    email: '',
  })
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.subject.trim()) errs.subject = '제목을 입력해주세요'
    else if (form.subject.length > 100) errs.subject = '제목은 100자 이하로 입력해주세요'
    if (!form.message.trim()) errs.message = '내용을 입력해주세요'
    else if (form.message.length > 2000) errs.message = '내용은 2000자 이하로 입력해주세요'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = '올바른 이메일 형식으로 입력해주세요'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setStatus('submitting')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '익명',
          email: form.email.trim() || '',
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? '전송 실패')
      }

      setStatus('success')
      setForm({ subject: '', message: '', email: '' })
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center space-y-3">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        <h2 className="text-lg font-semibold text-foreground">문의가 접수되었습니다</h2>
        <p className="text-sm text-muted-foreground">
          이메일을 입력하셨다면 빠른 시일 내에 답장을 드리겠습니다.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="text-sm text-primary underline underline-offset-2 mt-2"
        >
          새 문의 작성하기
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {status === 'error' && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>전송에 실패했습니다. 잠시 후 다시 시도해 주세요.</span>
        </div>
      )}

      {/* 제목 */}
      <div className="space-y-1.5">
        <Label>
          제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          value={form.subject}
          onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
          placeholder="문의 제목 (최대 100자)"
          maxLength={100}
        />
        {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
      </div>

      {/* 내용 */}
      <div className="space-y-1.5">
        <Label>
          내용 <span className="text-destructive">*</span>
        </Label>
        <Textarea
          value={form.message}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
          placeholder="문의 내용을 입력해주세요 (최대 2000자)"
          rows={6}
          maxLength={2000}
          className="resize-none"
        />
        <div className="flex justify-between items-center">
          {errors.message ? (
            <p className="text-xs text-destructive">{errors.message}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted-foreground">{form.message.length}/2000</span>
        </div>
      </div>

      {/* 이메일 */}
      <div className="space-y-1.5">
        <Label>이메일 (선택 — 답장을 원하시면 입력해 주세요)</Label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          placeholder="답장 받을 이메일"
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        <Mail className="h-4 w-4" />
        {status === 'submitting' ? '전송 중...' : '보내기'}
      </button>
    </form>
  )
}
