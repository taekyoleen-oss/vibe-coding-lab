'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MarkdownEditor } from '@/components/common/MarkdownEditor'
import type { SafeVcApp, SafeVcRequestPost, SafeVcInfoCard, VcLink, ContentType, LinkCategory } from '@/output/step2_types'

type OwnerContent = SafeVcApp | SafeVcRequestPost | SafeVcInfoCard | VcLink

interface OwnerEditFormProps {
  contentType: ContentType
  content: OwnerContent
}

const LINK_CATEGORIES: { value: LinkCategory; label: string }[] = [
  { value: 'tool', label: '도구' },
  { value: 'document', label: '문서' },
  { value: 'community', label: '커뮤니티' },
  { value: 'video', label: '영상' },
  { value: 'other', label: '기타' },
]

export function OwnerEditForm({ contentType, content }: OwnerEditFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  // App form
  const [appForm, setAppForm] = useState(() => {
    if (contentType !== 'app') return null
    const app = content as SafeVcApp
    return {
      title: app.title,
      description: app.description,
      app_url: app.app_url,
      initial_prompt: app.initial_prompt ?? '',
      markdown_content: app.markdown_content ?? '',
    }
  })

  // Request form
  const [requestForm, setRequestForm] = useState(() => {
    if (contentType !== 'request') return null
    const req = content as SafeVcRequestPost
    return { title: req.title, content: req.content }
  })

  // Info form
  const [infoForm, setInfoForm] = useState(() => {
    if (contentType !== 'info') return null
    const info = content as SafeVcInfoCard
    return {
      title: info.title,
      summary: info.summary ?? '',
      markdown_content: info.markdown_content ?? '',
    }
  })

  // Link form
  const [linkForm, setLinkForm] = useState(() => {
    if (contentType !== 'link') return null
    const link = content as VcLink
    return {
      title: link.title,
      description: link.description ?? '',
      url: link.url,
      category: link.category,
    }
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      let body: Record<string, unknown> = {}
      let endpoint = ''

      if (contentType === 'app' && appForm) {
        body = appForm
        endpoint = `/api/apps/${content.id}/owner`
      } else if (contentType === 'request' && requestForm) {
        body = requestForm
        endpoint = `/api/requests/${content.id}/owner`
      } else if (contentType === 'info' && infoForm) {
        body = infoForm
        endpoint = `/api/info/${content.id}/owner`
      } else if (contentType === 'link' && linkForm) {
        body = linkForm
        endpoint = `/api/links/${content.id}/owner`
      }

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? '수정 실패')
      }

      setSaved(true)
      setTimeout(() => {
        router.refresh()
        setSaved(false)
      }, 1500)
    } catch (err) {
      alert(err instanceof Error ? err.message : '수정에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* App 수정 폼 */}
      {contentType === 'app' && appForm && (
        <>
          <div className="space-y-1.5">
            <Label>앱 이름</Label>
            <Input
              value={appForm.title}
              onChange={(e) => setAppForm((p) => p && { ...p, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>앱 설명</Label>
            <Textarea
              value={appForm.description}
              onChange={(e) => setAppForm((p) => p && { ...p, description: e.target.value })}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label>앱 URL</Label>
            <Input
              type="url"
              value={appForm.app_url}
              onChange={(e) => setAppForm((p) => p && { ...p, app_url: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>초기 프롬프트</Label>
            <Textarea
              value={appForm.initial_prompt}
              onChange={(e) => setAppForm((p) => p && { ...p, initial_prompt: e.target.value })}
              rows={4}
              className="font-mono text-sm resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label>마크다운 설명</Label>
            <MarkdownEditor
              value={appForm.markdown_content}
              onChange={(v) => setAppForm((p) => p && { ...p, markdown_content: v })}
              height={250}
            />
          </div>
        </>
      )}

      {/* Request 수정 폼 */}
      {contentType === 'request' && requestForm && (
        <>
          <div className="space-y-1.5">
            <Label>제목</Label>
            <Input
              value={requestForm.title}
              onChange={(e) => setRequestForm((p) => p && { ...p, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>내용</Label>
            <MarkdownEditor
              value={requestForm.content}
              onChange={(v) => setRequestForm((p) => p && { ...p, content: v })}
              height={250}
            />
          </div>
        </>
      )}

      {/* Info 수정 폼 */}
      {contentType === 'info' && infoForm && (
        <>
          <div className="space-y-1.5">
            <Label>제목</Label>
            <Input
              value={infoForm.title}
              onChange={(e) => setInfoForm((p) => p && { ...p, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>요약</Label>
            <Textarea
              value={infoForm.summary}
              onChange={(e) => setInfoForm((p) => p && { ...p, summary: e.target.value })}
              rows={2}
              className="resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label>마크다운 내용</Label>
            <MarkdownEditor
              value={infoForm.markdown_content}
              onChange={(v) => setInfoForm((p) => p && { ...p, markdown_content: v })}
              height={250}
            />
          </div>
        </>
      )}

      {/* Link 수정 폼 */}
      {contentType === 'link' && linkForm && (
        <>
          <div className="space-y-1.5">
            <Label>제목</Label>
            <Input
              value={linkForm.title}
              onChange={(e) => setLinkForm((p) => p && { ...p, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>설명</Label>
            <Textarea
              value={linkForm.description}
              onChange={(e) => setLinkForm((p) => p && { ...p, description: e.target.value })}
              rows={2}
              className="resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label>URL</Label>
            <Input
              type="url"
              value={linkForm.url}
              onChange={(e) => setLinkForm((p) => p && { ...p, url: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>카테고리</Label>
            <Select
              value={linkForm.category}
              onValueChange={(v) => setLinkForm((p) => p && { ...p, category: v as LinkCategory })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LINK_CATEGORIES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {saved ? (
          <>
            <CheckCircle className="h-4 w-4" />
            저장됨
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            {submitting ? '저장 중...' : '수정 저장'}
          </>
        )}
      </button>
    </form>
  )
}
