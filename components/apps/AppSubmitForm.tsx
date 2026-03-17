'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Upload, Sparkles, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MarkdownEditor } from '@/components/common/MarkdownEditor'
import { AiRefineButton } from './AiRefineButton'
import { AiRefinePreview } from './AiRefinePreview'
import type {
  CreateAppInput,
  AppLevel,
  VibeTool,
  RefineAppResponse,
} from '@/output/step2_types'

const APP_MARKDOWN_TEMPLATE = `## 앱 소개
<!-- 이 앱이 무엇을 하는지 한두 문장으로 설명해 주세요 -->

## 주요 기능
-
-
-

## 사용 방법
1.
2.
3.

## 개발 배경
<!-- 왜 이 앱을 만들었는지 간단히 설명해 주세요 -->

## 참고 사항
<!-- API KEY 필요 여부, 사용 제한, 주의사항 등 -->
`

const VIBE_TOOLS: VibeTool[] = [
  'Claude Code',
  'Cursor',
  'Windsurf',
  'v0',
  'Bolt',
  'Replit',
  '기타',
]

interface AppSubmitFormProps {
  defaultNickname?: string
}

export function AppSubmitForm({ defaultNickname = '' }: AppSubmitFormProps) {
  const router = useRouter()

  const [form, setForm] = useState<Partial<CreateAppInput>>({
    title: '',
    description: '',
    app_url: '',
    uses_api_key: false,
    initial_prompt: '',
    markdown_content: APP_MARKDOWN_TEMPLATE,
    author_nickname: defaultNickname,
  })

  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [ogImageUrl, setOgImageUrl] = useState<string | null>(null)
  const [ogFetching, setOgFetching] = useState(false)
  const [aiResult, setAiResult] = useState<RefineAppResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof CreateAppInput, string>>>({})
  const ogFetchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleField<K extends keyof CreateAppInput>(key: K, value: CreateAppInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))

    // 앱 URL 변경 시 OG 이미지 자동 감지 (디바운스 1.5초)
    if (key === 'app_url' && typeof value === 'string') {
      if (ogFetchTimeout.current) clearTimeout(ogFetchTimeout.current)
      setOgImageUrl(null)
      const url = value.trim()
      if (url.startsWith('https://')) {
        ogFetchTimeout.current = setTimeout(() => autoFetchOgImage(url), 1500)
      }
    }
  }

  async function autoFetchOgImage(url: string) {
    if (screenshotFile) return // 직접 업로드 파일이 있으면 스킵
    setOgFetching(true)
    try {
      const res = await fetch(`/api/og-image?url=${encodeURIComponent(url)}`)
      if (res.ok) {
        const { imageUrl } = await res.json()
        if (imageUrl) setOgImageUrl(imageUrl)
      }
    } catch {
      // 무시
    } finally {
      setOgFetching(false)
    }
  }

  const applyImageFile = useCallback((file: File) => {
    setScreenshotFile(file)
    setScreenshotPreview(URL.createObjectURL(file))
    setOgImageUrl(null)
  }, [])

  function handleScreenshot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    applyImageFile(file)
  }

  function clearScreenshot() {
    setScreenshotFile(null)
    setScreenshotPreview(null)
  }

  useEffect(() => {
    function handleGlobalPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) applyImageFile(file)
          break
        }
      }
    }
    window.addEventListener('paste', handleGlobalPaste)
    return () => window.removeEventListener('paste', handleGlobalPaste)
  }, [applyImageFile])

  function handleAiApply(result: RefineAppResponse) {
    setForm((prev) => ({
      ...prev,
      title: result.title,
      description: result.description,
      ...(result.initial_prompt ? { initial_prompt: result.initial_prompt } : {}),
    }))
    setAiResult(null)
  }

  function validate(): boolean {
    const newErrors: typeof errors = {}
    if (!form.title?.trim()) newErrors.title = '제목을 입력해주세요'
    if (!form.description?.trim()) newErrors.description = '설명을 입력해주세요'
    if (!form.app_url?.trim()) newErrors.app_url = '앱 URL을 입력해주세요'
    if (!form.author_nickname?.trim()) newErrors.author_nickname = '닉네임을 입력해주세요'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    try {
      let screenshot_url: string | undefined

      // 스크린샷 업로드
      if (screenshotFile) {
        const fd = new FormData()
        fd.append('file', screenshotFile)
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (upRes.ok) {
          const { url } = await upRes.json()
          screenshot_url = url
        }
      }

      const payload: CreateAppInput = {
        title: form.title!,
        description: form.description!,
        app_url: form.app_url!,
        uses_api_key: form.uses_api_key ?? false,
        author_nickname: form.author_nickname!,
        ...(form.level ? { level: form.level } : {}),
        ...(form.vibe_tool ? { vibe_tool: form.vibe_tool } : {}),
        ...(form.initial_prompt ? { initial_prompt: form.initial_prompt } : {}),
        ...(form.markdown_content ? { markdown_content: form.markdown_content } : {}),
        ...(screenshot_url ? { screenshot_url } : {}),
      }

      const res = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? '등록 실패')
      }

      const { data } = await res.json()
      router.push(`/apps/${data.id}`)
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : '앱 등록에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* 제목 */}
      <div className="space-y-1.5">
        <Label>
          제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          value={form.title}
          onChange={(e) => handleField('title', e.target.value)}
          placeholder="앱 이름을 입력하세요"
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
      </div>

      {/* 설명 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>
            설명 <span className="text-destructive">*</span>
          </Label>
          <AiRefineButton
            input={{
              title: form.title ?? '',
              description: form.description ?? '',
              initial_prompt: form.initial_prompt,
              app_url: form.app_url,
            }}
            onResult={(result) => setAiResult(result)}
          />
        </div>
        <Textarea
          value={form.description}
          onChange={(e) => handleField('description', e.target.value)}
          placeholder="앱이 어떤 기능을 하는지 간단히 설명해주세요"
          rows={3}
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
        {aiResult && (
          <AiRefinePreview
            result={aiResult}
            onApply={handleAiApply}
            onCancel={() => setAiResult(null)}
          />
        )}
      </div>

      {/* 앱 URL */}
      <div className="space-y-1.5">
        <Label>
          앱 URL <span className="text-destructive">*</span>
        </Label>
        <Input
          type="url"
          value={form.app_url}
          onChange={(e) => handleField('app_url', e.target.value)}
          placeholder="https://..."
        />
        {errors.app_url && <p className="text-xs text-destructive">{errors.app_url}</p>}
      </div>

      {/* 레벨 */}
      <div className="space-y-1.5">
        <Label>난이도</Label>
        <Select
          value={form.level ?? ''}
          onValueChange={(v) => handleField('level', v as AppLevel)}
        >
          <SelectTrigger>
            <SelectValue placeholder="난이도 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">초급</SelectItem>
            <SelectItem value="intermediate">중급</SelectItem>
            <SelectItem value="advanced">고급</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* API 키 여부 */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="uses_api_key"
          checked={form.uses_api_key}
          onCheckedChange={(v) => handleField('uses_api_key', v === true)}
        />
        <Label htmlFor="uses_api_key" className="cursor-pointer font-normal">
          이 앱은 API 키가 필요합니다
        </Label>
      </div>

      {/* Vibe 도구 */}
      <div className="space-y-1.5">
        <Label>사용한 AI 도구</Label>
        <Select
          value={form.vibe_tool ?? ''}
          onValueChange={(v) => handleField('vibe_tool', v as VibeTool)}
        >
          <SelectTrigger>
            <SelectValue placeholder="도구 선택" />
          </SelectTrigger>
          <SelectContent>
            {VIBE_TOOLS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 초기 개발 프롬프트 */}
      <div className="space-y-1.5">
        <Label>초기 개발 프롬프트</Label>
        <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950 p-2.5 text-sm text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            개인정보, API 키, 비밀번호 등 민감한 정보는 입력하지 마세요.
            이 내용은 모든 방문자에게 공개됩니다.
          </span>
        </div>
        <Textarea
          value={form.initial_prompt}
          onChange={(e) => handleField('initial_prompt', e.target.value)}
          placeholder="처음 AI에게 입력한 개발 요청 프롬프트를 입력하세요 (선택)"
          rows={4}
          className="font-mono text-sm"
        />
      </div>

      {/* 마크다운 상세 설명 */}
      <div className="space-y-1.5">
        <Label>상세 설명 (마크다운)</Label>
        <MarkdownEditor
          value={form.markdown_content ?? ''}
          onChange={(v) => handleField('markdown_content', v)}
          height={400}
        />
      </div>

      {/* 스크린샷 업로드 */}
      <div className="space-y-1.5">
        <Label>스크린샷</Label>

        {/* OG 이미지 자동 감지 결과 */}
        {(ogFetching || ogImageUrl) && !screenshotPreview && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {ogFetching ? '앱 URL에서 이미지를 자동으로 가져오는 중...' : '앱 URL에서 이미지를 자동으로 가져왔어요'}
            </div>
            {ogImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ogImageUrl}
                alt="자동 감지된 앱 이미지"
                className="max-h-40 rounded-md object-cover border border-border w-full"
              />
            )}
          </div>
        )}

        {/* 직접 업로드 */}
        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/30">
          <Upload className="h-5 w-5 text-muted-foreground mb-1" />
          <span className="text-sm text-muted-foreground">
            {screenshotFile ? screenshotFile.name : '직접 업로드 (선택)'}
          </span>
          <span className="text-xs text-muted-foreground/60 mt-0.5">
            클릭하거나 드래그, 또는 <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">Ctrl+V</kbd> 로 붙여넣기
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleScreenshot}
            className="hidden"
          />
        </label>
        {screenshotPreview && (
          <div className="relative mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={screenshotPreview}
              alt="스크린샷 미리보기"
              className="max-h-48 rounded-md object-contain border border-border w-full"
            />
            <button
              type="button"
              onClick={clearScreenshot}
              className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 닉네임: 로그인 계정에서 자동 사용 */}
      <div className="space-y-1.5">
        <Label>닉네임</Label>
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 border border-border text-sm text-muted-foreground">
          {form.author_nickname || '(계정 닉네임이 자동으로 사용됩니다)'}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-sm py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? '등록 중...' : '앱 등록하기'}
      </button>
    </form>
  )
}
