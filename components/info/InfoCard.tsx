import Link from 'next/link'
import { Images, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { SafeVcInfoCard } from '@/output/step2_types'

interface InfoCardProps {
  card: SafeVcInfoCard
}

export function InfoCard({ card }: InfoCardProps) {
  const isSlides = card.content_type === 'slides'

  return (
    <Link
      href={`/info/${card.id}`}
      className="block rounded-lg border border-border bg-card p-5 hover:border-primary/50 hover:shadow-sm transition-all"
    >
      {/* 콘텐츠 타입 뱃지 */}
      <div className="flex items-center gap-2 mb-3">
        <Badge
          className={
            isSlides
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 gap-1'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 gap-1'
          }
        >
          {isSlides ? (
            <>
              <Images className="h-3 w-3" />
              슬라이드
            </>
          ) : (
            <>
              <FileText className="h-3 w-3" />
              마크다운
            </>
          )}
        </Badge>
      </div>

      {/* 제목 */}
      <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2">{card.title}</h3>

      {/* 요약 */}
      {card.summary && (
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {card.summary}
        </p>
      )}

      {/* 하단 메타 */}
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <span>{card.author_nickname}</span>
        <span>·</span>
        <span>{new Date(card.created_at).toLocaleDateString('ko-KR')}</span>
      </div>
    </Link>
  )
}
