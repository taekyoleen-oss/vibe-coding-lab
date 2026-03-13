'use client'

import { Check, X } from 'lucide-react'
import type { RefineAppResponse } from '@/output/step2_types'

interface AiRefinePreviewProps {
  result: RefineAppResponse
  onApply: (result: RefineAppResponse) => void
  onCancel: () => void
}

export function AiRefinePreview({ result, onApply, onCancel }: AiRefinePreviewProps) {
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-primary">AI 제안 결과</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onApply(result)}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            <Check className="h-3.5 w-3.5" />
            적용
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            취소
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            제목
          </span>
          <p className="mt-0.5 text-foreground">{result.title}</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            설명
          </span>
          <p className="mt-0.5 text-foreground whitespace-pre-wrap">{result.description}</p>
        </div>
        {result.initial_prompt && (
          <div>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              초기 프롬프트 (AI 수정)
            </span>
            <pre className="mt-0.5 text-foreground font-mono text-xs bg-muted rounded p-2 overflow-auto whitespace-pre-wrap">
              {result.initial_prompt}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
