import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { RequestStatus } from '@/output/step2_types'

const STATUS_STYLES: Record<RequestStatus, string> = {
  requested:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-transparent',
  in_progress:
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-transparent',
  completed:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-transparent',
  closed:
    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-transparent',
}

const STATUS_LABELS: Record<RequestStatus, string> = {
  requested: '요청됨',
  in_progress: '진행중',
  completed: '완료',
  closed: '닫힘',
}

interface StatusBadgeProps {
  status: RequestStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge className={cn(STATUS_STYLES[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
