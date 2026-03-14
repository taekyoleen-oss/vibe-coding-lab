'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, CheckCircle, Camera, Upload, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MarkdownEditor } from '@/components/common/MarkdownEditor'
import type { SafeVcApp, SafeVcRequestPost, SafeVcInfoCard, VcLink, ContentType, LinkCategory, AppLevel, VibeTool } from '@/output/step2_types'

const LEVELS: { value: AppLevel; label: string }[] = [
  { value: 'beginner', label: '초급' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' },
]

const VIBE_TOOLS: VibeTool[] = ['Claude Code', 'Cursor', 'Windsurf', 'v0', 'Bolt', 'Replit', '기타']

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
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [capturing, setCapturing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleScreenshotFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setScreenshotFile(file)
    setScreenshotPreview(URL.createObjectURL(file))
    setAppForm((p) => p && { ...p, screenshot_url: '' }) // 파일 우선
  }

  async function handleAutoCapture() {
    if (!appForm?.app_url) return
    setCapturing(true)
    try {
      const res = await fetch('/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: appForm.app_url }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'LOCAL_URL') {
          alert(data.message)
        } else {
          alert('스크린샷 자동 캡처에 실패했습니다. 직접 업로드해 주세요.')
        }
        return
      }
      setAppForm((p) => p && { ...p, screenshot_url: data.screenshotUrl })
      setScreenshotFile(null)
      setScreenshotPreview(null)
    } catch {
      alert('스크린샷 자동 캡처에 실패했습니다. 직접 업로드해 주세요.')
    } finally {
      setCapturing(false)
    }
  }

  function clearScreenshot() {
    setScreenshotFile(null)
    setScreenshotPreview(null)
    setAppForm((p) => p && { ...p, screenshot_url: '' })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // App form
  const [appForm, setAppForm] = useState(() => {
    if (contentType !== 'app') return null
    const app = content as SafeVcApp
    return {
      title: app.title,
      description: app.description,
      app_url: app.app_url,
      screenshot_url: app.screenshot_url ?? '',
      level: app.level ?? 'none',
      vibe_tool: app.vibe_tool ?? 'none',
      uses_api_key: app.uses_api_key ?? false,
      initial_prompt: app.initial_prompt ?? '',
      markdown_content: app.markdown_content ?? '',
      created_at: app.created_at ? app.created_at.slice(0, 10) : '',
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
        let finalScreenshotUrl = appForm.screenshot_url

        // 1. 파일 직접 업로드
        if (screenshotFile) {
          const fd = new FormData()
          fd.append('file', screenshotFile)
          const upRes = await fetch('/api/upload?bucket=app-screenshots', { method: 'POST', body: fd })
          if (upRes.ok) {
            const { url } = await upRes.json()
            finalScreenshotUrl = url
          }
        }

        // 2. 스크린샷 없으면 자동 캡처
        if (!finalScreenshotUrl && appForm.app_url) {
          const capRes = await fetch('/api/screenshot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: appForm.app_url }),
          })
          if (capRes.ok) {
            const { screenshotUrl } = await capRes.json()
            finalScreenshotUrl = screenshotUrl
          }
        }

        body = {
          ...appForm,
          screenshot_url: finalScreenshotUrl || null,
          level: appForm.level === 'none' ? null : appForm.level,
          vibe_tool: appForm.vibe_tool === 'none' ? null : appForm.vibe_tool,
        }
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

          {/* 레벨 */}
          <div className="space-y-1.5">
            <Label>난이도</Label>
            <Select
              value={appForm.level}
              onValueChange={(v) => setAppForm((p) => p && { ...p, level: v as AppLevel | 'none' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="선택 안 함" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">선택 안 함</SelectItem>
                {LEVELS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* AI 도구 */}
          <div className="space-y-1.5">
            <Label>AI 도구</Label>
            <Select
              value={appForm.vibe_tool}
              onValueChange={(v) => setAppForm((p) => p && { ...p, vibe_tool: v as VibeTool | 'none' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="선택 안 함" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">선택 안 함</SelectItem>
                {VIBE_TOOLS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* API 키 필요 여부 */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="edit_uses_api_key"
              checked={appForm.uses_api_key}
              onCheckedChange={(v) => setAppForm((p) => p && { ...p, uses_api_key: v === true })}
            />
            <Label htmlFor="edit_uses_api_key" className="cursor-pointer font-normal">
              API 키 필요
            </Label>
          </div>

          {/* 등록일 */}
          <div className="space-y-1.5">
            <Label>등록일</Label>
            <Input
              type="date"
              value={appForm.created_at}
              onChange={(e) => setAppForm((p) => p && { ...p, created_at: e.target.value })}
            />
          </div>

          {/* 스크린샷 */}
          <div className="space-y-2">
            <Label>스크린샷</Label>

            {/* 현재 이미지 미리보기 */}
            {(screenshotPreview || appForm.screenshot_url) && (
              <div className="relative rounded-lg overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={screenshotPreview ?? appForm.screenshot_url}
                  alt="스크린샷 미리보기"
                  className="w-full max-h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={clearScreenshot}
                  className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <div className="flex gap-2">
              {/* 파일 직접 업로드 */}
              <label className="flex-1 flex items-center justify-center gap-1.5 h-9 px-3 rounded-md border border-border text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors cursor-pointer bg-background">
                <Upload className="h-3.5 w-3.5" />
                직접 업로드
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotFile}
                  className="hidden"
                />
              </label>

              {/* 자동 캡처 */}
              <button
                type="button"
                onClick={handleAutoCapture}
                disabled={capturing || !appForm.app_url}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 px-3 rounded-md border border-border text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors disabled:opacity-50"
              >
                <Camera className="h-3.5 w-3.5" />
                {capturing ? '캡처 중...' : '웹페이지 자동 캡처'}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              저장 시 스크린샷이 없으면 웹페이지 초기화면이 자동으로 캡처됩니다.
            </p>
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
