import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { RequestType } from '@/output/step2_types'

const TYPE_STYLES: Record<RequestType, string> = {
  general:
    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-transparent',
  app_feedback:
    'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 border-transparent',
  app_error:
    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-transparent',
  app_update:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 border-transparent',
}

const TYPE_LABELS: Record<RequestType, string> = {
  general: '일반 문의',
  app_feedback: '앱 피드백',
  app_error: '오류 신고',
  app_update: '업데이트 요청',
}

interface RequestTypeBadgeProps {
  type: RequestType
  className?: string
}

export function RequestTypeBadge({ type, className }: RequestTypeBadgeProps) {
  return (
    <Badge className={cn(TYPE_STYLES[type], className)}>
      {TYPE_LABELS[type]}
    </Badge>
  )
}
