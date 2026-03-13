import { AppCard } from './AppCard'
import { Pagination } from '@/components/common/Pagination'
import type { SafeVcApp } from '@/output/step2_types'

interface AppGridProps {
  apps: SafeVcApp[]
  total: number
  currentPage: number
  pageSize?: number
  searchQuery?: string
}

export function AppGrid({
  apps,
  total,
  currentPage,
  pageSize = 12,
  searchQuery,
}: AppGridProps) {
  if (apps.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-sm">검색 결과가 없습니다.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {apps.map((app) => (
          <AppCard key={app.id} app={app} searchQuery={searchQuery} />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={total}
        pageSize={pageSize}
      />
    </div>
  )
}
