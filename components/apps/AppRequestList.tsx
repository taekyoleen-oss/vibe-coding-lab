import Link from 'next/link'
import { StatusBadge } from '@/components/requests/StatusBadge'
import { RequestTypeBadge } from '@/components/requests/RequestTypeBadge'
import type { SafeVcRequestPost } from '@/output/step2_types'

interface AppRequestListProps {
  requests: SafeVcRequestPost[]
}

export function AppRequestList({ requests }: AppRequestListProps) {
  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        아직 이 앱에 연결된 요청이 없습니다.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <Link
          key={req.id}
          href={`/requests/${req.id}`}
          className="block rounded-lg border border-border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="flex gap-2 flex-wrap shrink-0">
              <StatusBadge status={req.status} />
              <RequestTypeBadge type={req.request_type} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground line-clamp-1">
                {req.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {req.content}
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{req.author_nickname}</span>
            <span>·</span>
            <span>{new Date(req.created_at).toLocaleDateString('ko-KR')}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
