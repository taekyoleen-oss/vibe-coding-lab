import Link from 'next/link'
import { LayoutGrid } from 'lucide-react'
import { LevelBadge } from '@/components/apps/LevelBadge'
import type { SafeVcApp } from '@/output/step2_types'

interface LinkedAppMiniCardProps {
  app: Pick<SafeVcApp, 'id' | 'title' | 'level' | 'screenshot_url'>
}

export function LinkedAppMiniCard({ app }: LinkedAppMiniCardProps) {
  return (
    <Link
      href={`/apps/${app.id}`}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50 transition-colors text-sm"
    >
      {app.screenshot_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={app.screenshot_url}
          alt={app.title}
          className="h-6 w-8 rounded object-cover shrink-0"
        />
      ) : (
        <LayoutGrid className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
      <span className="font-medium text-foreground truncate max-w-[160px]">{app.title}</span>
      {app.level && <LevelBadge level={app.level} />}
    </Link>
  )
}
