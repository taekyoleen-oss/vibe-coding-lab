'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { VibeTool, AppLevel } from '@/output/step2_types'

const VIBE_TOOLS: (VibeTool | '전체')[] = [
  '전체',
  'Claude Code',
  'Cursor',
  'Windsurf',
  'v0',
  'Bolt',
  'Replit',
  '기타',
]

const LEVELS: { value: AppLevel | '전체'; label: string }[] = [
  { value: '전체', label: '전체 난이도' },
  { value: 'beginner', label: '초급' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' },
]

export function AppFilterChips() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentTool = searchParams.get('tool') ?? '전체'
  const currentLevel = searchParams.get('level') ?? '전체'
  const noApiKey = searchParams.get('uses_api_key') === 'false'

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '전체') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  function toggleNoApiKey() {
    const params = new URLSearchParams(searchParams.toString())
    if (noApiKey) {
      params.delete('uses_api_key')
    } else {
      params.set('uses_api_key', 'false')
    }
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-3">
      {/* API 키 필터 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={toggleNoApiKey}
          className={cn(
            'text-xs px-3 py-1.5 rounded-full border transition-colors',
            noApiKey
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
          )}
        >
          API키 불필요
        </button>
      </div>

      {/* 레벨 필터 */}
      <div className="flex flex-wrap gap-2">
        {LEVELS.map((lvl) => (
          <button
            key={lvl.value}
            onClick={() => updateParam('level', lvl.value)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full border transition-colors',
              currentLevel === lvl.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
            )}
          >
            {lvl.label}
          </button>
        ))}
      </div>

      {/* Vibe 도구 필터 */}
      <div className="flex flex-wrap gap-2">
        {VIBE_TOOLS.map((tool) => (
          <button
            key={tool}
            onClick={() => updateParam('tool', tool)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full border transition-colors',
              currentTool === tool
                ? 'bg-secondary text-secondary-foreground border-secondary'
                : 'border-border text-muted-foreground hover:border-secondary hover:text-secondary-foreground'
            )}
          >
            {tool}
          </button>
        ))}
      </div>
    </div>
  )
}
