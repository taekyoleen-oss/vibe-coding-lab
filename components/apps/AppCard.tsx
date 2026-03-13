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

export function AppCard({ app, searchQuery: _searchQuery }: AppCardProps) {
  return (
    <Link href={`/apps/${app.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        <Card className="bg-card shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer h-full overflow-hidden">
          {/* 스크린샷 */}
          {app.screenshot_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={app.screenshot_url}
              alt={`${app.title} 스크린샷`}
              className="w-full h-40 object-cover"
            />
          ) : (
            <div className="w-full h-40 bg-muted flex items-center justify-center text-muted-foreground text-sm">
              이미지 없음
            </div>
          )}
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
