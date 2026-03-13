'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, AlertTriangle, Images, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { NicknameInput } from '@/components/common/NicknameInput'
import { MarkdownEditor } from '@/components/common/MarkdownEditor'
import type { CreateInfoCardInput, InfoContentType } from '@/output/step2_types'

const MAX_SLIDES = 20
const MAX_FILE_SIZE_MB = 5

export function InfoSubmitForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<Partial<CreateInfoCardInput>>({
    title: '',
    summary: '',
    content_type: 'markdown',
    markdown_content: '',
    author_nickname: '',
    author_email: '',
  })
  const [slideFiles, setSlideFiles] = useState<File[]>([])
  const [slidePreviews, setSlidePreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.title?.trim()) errs.title = '제목을 입력해주세요'
    if (!form.author_nickname?.trim()) errs.author_nickname = '닉네임을 입력해주세요'
    if (form.content_type === 'markdown' && !form.markdown_content?.trim()) {
      errs.markdown_content = '마크다운 내용을 입력해주세요'
    }
    if (form.content_type === 'slides' && slideFiles.length === 0) {
      errs.slides = '슬라이드 이미지를 1장 이상 업로드해주세요'
    }
    if (form.author_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.author_email)) {
      errs.author_email = '올바른 이메일 형식으로 입력해주세요'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const validFiles = files.filter((f) => {
      if (!f.type.startsWith('image/')) return false
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) return false
      return true
    })

    const remaining = MAX_SLIDES - slideFiles.length
    const toAdd = validFiles.slice(0, remaining)

    setSlideFiles((prev) => [...prev, ...toAdd])
    toAdd.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setSlidePreviews((prev) => [...prev, ev.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
    // input 초기화
    e.target.value = ''
  }

  function removeSlide(index: number) {
    setSlideFiles((prev) => prev.filter((_, i) => i !== index))
    setSlidePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  async function uploadSlides(): Promise<string[]> {
    const urls: string[] = []
    for (const file of slideFiles) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'vc-info-slides')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('이미지 업로드 실패')
      const json = await res.json()
      urls.push(json.url)
    }
    return urls
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    try {
      let slideUrls: string[] = []
      if (form.content_type === 'slides') {
        setUploading(true)
        slideUrls = await uploadSlides()
        setUploading(false)
      }

      const payload: CreateInfoCardInput = {
        title: form.title!.trim(),
        content_type: form.content_type!,
        author_nickname: form.author_nickname!.trim(),
        ...(form.summary?.trim() ? { summary: form.summary.trim() } : {}),
        ...(form.content_type === 'markdown' ? { markdown_content: form.markdown_content } : {}),
        ...(form.author_email?.trim() ? { author_email: form.author_email.trim() } : {}),
      }

      const res = await fetch('/api/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, slide_urls: slideUrls }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? '등록 실패')
      }

      const { data } = await res.json()
      router.push(`/info/${data.id}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : '등록에 실패했습니다.')
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  const contentType = form.content_type as InfoContentType

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 콘텐츠 타입 선택 */}
      <div className="space-y-1.5">
        <Label>콘텐츠 유형 *</Label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, content_type: 'markdown' }))}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all ${
              contentType === 'markdown'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-foreground/30'
            }`}
          >
            <FileText className="h-4 w-4" />
            마크다운
          </button>
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, content_type: 'slides' }))}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all ${
              contentType === 'slides'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-foreground/30'
            }`}
          >
            <Images className="h-4 w-4" />
            슬라이드
          </button>
        </div>
      </div>

      {/* 제목 */}
      <div className="space-y-1.5">
        <Label>
          제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="정보 공유 제목을 입력하세요"
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
      </div>

      {/* 요약 */}
      <div className="space-y-1.5">
        <Label>요약 (선택)</Label>
        <Textarea
          value={form.summary ?? ''}
          onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
          placeholder="목록 카드에 표시될 요약 (선택)"
          rows={2}
          className="resize-none"
        />
      </div>

      {/* 마크다운 에디터 */}
      {contentType === 'markdown' && (
        <div className="space-y-1.5">
          <Label>
            마크다운 내용 <span className="text-destructive">*</span>
          </Label>
          <MarkdownEditor
            value={form.markdown_content ?? ''}
            onChange={(v) => setForm((p) => ({ ...p, markdown_content: v }))}
            placeholder="마크다운으로 내용을 작성하세요"
            height={350}
          />
          {errors.markdown_content && (
            <p className="text-xs text-destructive">{errors.markdown_content}</p>
          )}
        </div>
      )}

      {/* 슬라이드 업로드 */}
      {contentType === 'slides' && (
        <div className="space-y-2">
          <Label>
            슬라이드 이미지 <span className="text-destructive">*</span>
            <span className="text-xs text-muted-foreground ml-2">최대 {MAX_SLIDES}장</span>
          </Label>

          <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950 p-2.5 text-sm text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>각 이미지는 {MAX_FILE_SIZE_MB}MB 이하, JPG/PNG/WebP 형식만 지원합니다.</span>
          </div>

          {/* 업로드 버튼 */}
          {slideFiles.length < MAX_SLIDES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-8 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
            >
              <Upload className="h-6 w-6" />
              <span>클릭하여 이미지 추가</span>
              <span className="text-xs">{slideFiles.length}/{MAX_SLIDES}</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          {/* 미리보기 그리드 */}
          {slidePreviews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
              {slidePreviews.map((src, i) => (
                <div key={i} className="relative group aspect-video rounded-md overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`슬라이드 ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeSlide(i)}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          {errors.slides && <p className="text-xs text-destructive">{errors.slides}</p>}
        </div>
      )}

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
          placeholder="소유권 인증용 이메일 (공개되지 않습니다)"
        />
        {errors.author_email && (
          <p className="text-xs text-destructive">{errors.author_email}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-sm py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {uploading ? '이미지 업로드 중...' : submitting ? '등록 중...' : '등록하기'}
      </button>
    </form>
  )
}
