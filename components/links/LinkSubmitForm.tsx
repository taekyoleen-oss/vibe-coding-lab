'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Link as LinkIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NicknameInput } from '@/components/common/NicknameInput'
import type { CreateLinkInput, LinkCategory } from '@/output/step2_types'

const CATEGORY_LABELS: Record<LinkCategory, string> = {
  tool:      '도구',
  document:  '문서',
  community: '커뮤니티',
  video:     '영상',
  other:     '기타',
}

export function LinkSubmitForm() {
  const router = useRouter()
  const [form, setForm] = useState<Partial<CreateLinkInput>>({
    title: '',
    description: '',
    url: '',
    category: 'other',
    icon_url: '',
    author_nickname: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [crawling, setCrawling] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.title?.trim()) errs.title = '제목을 입력해주세요'
    if (!form.url?.trim()) errs.url = 'URL을 입력해주세요'
    else if (!/^https:\/\/.+/.test(form.url.trim())) {
      errs.url = 'https:// 로 시작하는 URL만 입력 가능합니다'
    }
    if (!form.author_nickname?.trim()) errs.author_nickname = '닉네임을 입력해주세요'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleUrlBlur() {
    const url = form.url?.trim()
    if (!url || !/^https:\/\/.+/.test(url)) return
    if (form.title?.trim()) return // 이미 제목 있으면 크롤링 스킵

    setCrawling(true)
    try {
      const res = await fetch(`/api/links/meta?url=${encodeURIComponent(url)}`)
      if (res.ok) {
        const meta = await res.json()
        setForm((p) => ({
          ...p,
          title: p.title?.trim() ? p.title : (meta.title ?? ''),
          description: p.description?.trim() ? p.description : (meta.description ?? ''),
          icon_url: p.icon_url?.trim() ? p.icon_url : (meta.icon_url ?? ''),
        }))
      }
    } catch {
      // 크롤링 실패 무시
    } finally {
      setCrawling(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    try {
      const payload: CreateLinkInput = {
        title: form.title!.trim(),
        url: form.url!.trim(),
        category: form.category ?? 'other',
        author_nickname: form.author_nickname!.trim(),
        ...(form.description?.trim() ? { description: form.description.trim() } : {}),
        ...(form.icon_url?.trim() ? { icon_url: form.icon_url.trim() } : {}),
      }

      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? '링크 추가 실패')
      }

      router.push('/links')
    } catch (err) {
      alert(err instanceof Error ? err.message : '링크 추가에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* URL */}
      <div className="space-y-1.5">
        <Label>
          URL <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            type="url"
            value={form.url}
            onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
            onBlur={handleUrlBlur}
            placeholder="https://example.com"
          />
          {crawling && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        {crawling && (
          <p className="text-xs text-muted-foreground">메타데이터 자동 불러오는 중...</p>
        )}
        {errors.url && <p className="text-xs text-destructive">{errors.url}</p>}
        <p className="text-xs text-muted-foreground">https:// 형식의 URL만 입력 가능합니다</p>
      </div>

      {/* 제목 */}
      <div className="space-y-1.5">
        <Label>
          제목 <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="링크 제목"
          />
          {crawling && !form.title?.trim() && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
      </div>

      {/* 설명 */}
      <div className="space-y-1.5">
        <Label>설명 (선택)</Label>
        <Textarea
          value={form.description ?? ''}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="링크에 대한 간단한 설명"
          rows={3}
          className="resize-none"
        />
      </div>

      {/* 카테고리 */}
      <div className="space-y-1.5">
        <Label>카테고리</Label>
        <Select
          value={form.category}
          onValueChange={(v) => setForm((p) => ({ ...p, category: v as LinkCategory }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(CATEGORY_LABELS) as [LinkCategory, string][]).map(([val, label]) => (
              <SelectItem key={val} value={val}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 아이콘 URL */}
      <div className="space-y-1.5">
        <Label>아이콘 URL (선택)</Label>
        <div className="flex items-center gap-2">
          {form.icon_url?.trim() && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.icon_url}
              alt="아이콘 미리보기"
              className="h-8 w-8 rounded object-contain border border-border"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          )}
          <Input
            type="url"
            value={form.icon_url ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, icon_url: e.target.value }))}
            placeholder="https://example.com/favicon.ico"
            className="flex-1"
          />
        </div>
      </div>

      {/* 닉네임 */}
      <NicknameInput
        value={form.author_nickname ?? ''}
        onChange={(v) => setForm((p) => ({ ...p, author_nickname: v }))}
        required
        error={errors.author_nickname}
      />

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        <LinkIcon className="h-4 w-4" />
        {submitting ? '추가 중...' : '링크 추가하기'}
      </button>
    </form>
  )
}
