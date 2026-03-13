import Link from 'next/link'
import { StatusBadge } from './StatusBadge'
import { RequestTypeBadge } from './RequestTypeBadge'
import { LinkedAppMiniCard } from './LinkedAppMiniCard'
import type { SafeVcRequestPost, SafeVcApp } from '@/output/step2_types'

interface RequestPostCardProps {
  request: SafeVcRequestPost
  linkedApp?: Pick<SafeVcApp, 'id' | 'title' | 'level' | 'screenshot_url'> | null
}

export function RequestPostCard({ request, linkedApp }: RequestPostCardProps) {
  return (
    <Link
      href={`/requests/${request.id}`}
      className="block rounded-lg border border-border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3 flex-wrap">
        <div className="flex gap-2">
          <StatusBadge status={request.status} />
          <RequestTypeBadge type={request.request_type} />
        </div>
      </div>

      <h3 className="mt-2 text-sm font-semibold text-foreground line-clamp-2">
        {request.title}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
        {request.content}
      </p>

      {linkedApp && (
        <div className="mt-3">
          <LinkedAppMiniCard app={linkedApp} />
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span>{request.author_nickname}</span>
        <span>·</span>
        <span>{new Date(request.created_at).toLocaleDateString('ko-KR')}</span>
        {request.view_count > 0 && (
          <>
            <span>·</span>
            <span>조회 {request.view_count}</span>
          </>
        )}
      </div>
    </Link>
  )
}
