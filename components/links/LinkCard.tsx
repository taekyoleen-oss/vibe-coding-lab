'use client'

import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { VcLink, LinkCategory } from '@/output/step2_types'

const CATEGORY_STYLES: Record<LinkCategory, string> = {
  tool:      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  document:  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  community: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  video:     'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  other:     'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

const CATEGORY_LABELS: Record<LinkCategory, string> = {
  tool:      '도구',
  document:  '문서',
  community: '커뮤니티',
  video:     '영상',
  other:     '기타',
}

interface LinkCardProps {
  link: VcLink
}

export function LinkCard({ link }: LinkCardProps) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all group"
    >
      {/* 아이콘 */}
      <div className="h-10 w-10 rounded-lg border border-border bg-muted/50 flex items-center justify-center shrink-0 overflow-hidden">
        {link.icon_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={link.icon_url}
            alt={`${link.title} 아이콘`}
            className="h-8 w-8 object-contain"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement
              target.style.display = 'none'
              target.parentElement?.querySelector('.fallback')?.classList.remove('hidden')
            }}
          />
        ) : null}
        <ExternalLink
          className={`h-4 w-4 text-muted-foreground ${link.icon_url ? 'hidden fallback' : ''}`}
        />
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {link.title}
          </h3>
          <Badge className={`shrink-0 text-xs ${CATEGORY_STYLES[link.category]}`}>
            {CATEGORY_LABELS[link.category]}
          </Badge>
        </div>
        {link.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {link.description}
          </p>
        )}
        <p className="mt-1.5 text-xs text-muted-foreground/60 truncate">{link.url}</p>
      </div>
    </a>
  )
}
