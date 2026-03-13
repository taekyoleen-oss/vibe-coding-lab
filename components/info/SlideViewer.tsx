'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VcInfoSlide } from '@/output/step2_types'

interface SlideViewerProps {
  slides: VcInfoSlide[]
}

export function SlideViewer({ slides }: SlideViewerProps) {
  const [current, setCurrent] = useState(0)
  const total = Math.min(slides.length, 20)
  const visibleSlides = slides.slice(0, total)

  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), [])
  const next = useCallback(() => setCurrent((c) => Math.min(total - 1, c + 1)), [total])

  if (visibleSlides.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 rounded-xl border border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">슬라이드가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="relative select-none">
      {/* 슬라이드 이미지 */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-black">
        {visibleSlides.map((slide, i) => (
          <div
            key={slide.id}
            className={cn(
              'transition-opacity duration-300',
              i === current ? 'block opacity-100' : 'hidden opacity-0'
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.slide_url}
              alt={slide.alt_text ?? `슬라이드 ${i + 1}`}
              className="w-full max-h-[600px] object-contain"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}

        {/* 이전/다음 버튼 */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              disabled={current === 0}
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-9 w-9 rounded-full bg-black/50 text-white transition-all hover:bg-black/70',
                current === 0 && 'opacity-30 cursor-not-allowed'
              )}
              aria-label="이전 슬라이드"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              disabled={current === total - 1}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-9 w-9 rounded-full bg-black/50 text-white transition-all hover:bg-black/70',
                current === total - 1 && 'opacity-30 cursor-not-allowed'
              )}
              aria-label="다음 슬라이드"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* 페이지 카운터 */}
        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/50 text-white text-xs">
          {current + 1} / {total}
        </div>
      </div>

      {/* 인디케이터 */}
      {total > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {visibleSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === current ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
