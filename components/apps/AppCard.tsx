'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { LevelBadge } from './LevelBadge'
import type { SafeVcApp } from '@/output/step2_types'

interface AppCardProps {
  app: SafeVcApp
  searchQuery?: string
}

// 도구별 그라데이션 + 텍스트 색상
const TOOL_GRADIENT: Record<string, { bg: string; text: string; dot: string }> = {
  'Claude Code': {
    bg: 'from-orange-400 to-amber-500',
    text: 'text-white',
    dot: 'bg-orange-200',
  },
  Cursor: {
    bg: 'from-blue-500 to-blue-700',
    text: 'text-white',
    dot: 'bg-blue-200',
  },
  Windsurf: {
    bg: 'from-teal-400 to-cyan-600',
    text: 'text-white',
    dot: 'bg-teal-200',
  },
  v0: {
    bg: 'from-gray-700 to-gray-900',
    text: 'text-white',
    dot: 'bg-gray-400',
  },
  Bolt: {
    bg: 'from-violet-500 to-purple-700',
    text: 'text-white',
    dot: 'bg-violet-200',
  },
  Replit: {
    bg: 'from-indigo-400 to-blue-600',
    text: 'text-white',
    dot: 'bg-indigo-200',
  },
  기타: {
    bg: 'from-emerald-400 to-green-600',
    text: 'text-white',
    dot: 'bg-emerald-200',
  },
}

const DEFAULT_GRADIENT = {
  bg: 'from-slate-400 to-slate-600',
  text: 'text-white',
  dot: 'bg-slate-300',
}

function AppCardPlaceholder({ app }: { app: SafeVcApp }) {
  const style = (app.vibe_tool ? TOOL_GRADIENT[app.vibe_tool] : null) ?? DEFAULT_GRADIENT
  const initial = app.title.charAt(0).toUpperCase()
  const domain = (() => {
    try {
      return new URL(app.app_url).hostname.replace(/^www\./, '')
    } catch {
      return app.app_url
    }
  })()

  return (
    <div
      className={`w-full h-40 bg-gradient-to-br ${style.bg} flex flex-col items-center justify-center gap-2 relative overflow-hidden`}
    >
      {/* 배경 장식 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 right-3 w-16 h-16 rounded-full bg-white" />
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white translate-y-8 -translate-x-4" />
      </div>
      {/* 이니셜 아이콘 */}
      <div className={`w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center ${style.text} text-xl font-bold shadow-sm`}>
        {initial}
      </div>
      {/* 도메인 */}
      <span className={`text-xs ${style.text} opacity-80 font-medium px-2 py-0.5 rounded-full bg-black/10`}>
        {domain}
      </span>
      {/* 도구 뱃지 */}
      {app.vibe_tool && (
        <span className={`text-[10px] ${style.text} opacity-70`}>{app.vibe_tool}</span>
      )}
    </div>
  )
}

export function AppCard({ app, searchQuery: _searchQuery }: AppCardProps) {
  return (
    <Link href={`/apps/${app.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        <Card className="bg-card shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer h-full overflow-hidden">
          {/* 스크린샷 or 자동 플레이스홀더 */}
          {app.screenshot_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={app.screenshot_url}
              alt={`${app.title} 스크린샷`}
              className="w-full h-40 object-cover"
              onError={(e) => {
                // 이미지 로드 실패 시 부모를 숨기고 플레이스홀더 표시
                const target = e.currentTarget
                target.style.display = 'none'
                const placeholder = target.nextElementSibling as HTMLElement | null
                if (placeholder) placeholder.style.display = 'flex'
              }}
            />
          ) : null}
          {/* 이미지 오류 또는 screenshot_url 없을 때 항상 렌더 */}
          <div style={app.screenshot_url ? { display: 'none' } : {}}>
            <AppCardPlaceholder app={app} />
          </div>

          <CardContent className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">
                {app.title}
              </h3>
              {app.level && <LevelBadge level={app.level} />}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {app.description}
            </p>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {app.vibe_tool && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary-foreground border border-secondary/30">
                  {app.vibe_tool}
                </span>
              )}
              {app.uses_api_key && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  API키 필요
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              by {app.author_nickname}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}
