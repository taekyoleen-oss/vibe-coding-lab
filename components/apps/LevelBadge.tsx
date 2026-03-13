import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AppLevel } from '@/output/step2_types'

const LEVEL_STYLES: Record<AppLevel, string> = {
  beginner:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-transparent',
  intermediate:
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-transparent',
  advanced:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-transparent',
}

const LEVEL_LABELS: Record<AppLevel, string> = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
}

interface LevelBadgeProps {
  level: AppLevel
  className?: string
}

export function LevelBadge({ level, className }: LevelBadgeProps) {
  return (
    <Badge className={cn(LEVEL_STYLES[level], className)}>
      {LEVEL_LABELS[level]}
    </Badge>
  )
}
