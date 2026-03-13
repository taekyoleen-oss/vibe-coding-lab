'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalItems: number
  pageSize?: number
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize = 12,
}: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(totalItems / pageSize)

  if (totalPages <= 1) return null

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    return `${pathname}?${params.toString()}`
  }

  // 표시할 페이지 범위 계산 (최대 5개)
  const delta = 2
  const range: number[] = []
  for (
    let i = Math.max(1, currentPage - delta);
    i <= Math.min(totalPages, currentPage + delta);
    i++
  ) {
    range.push(i)
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="페이지 네비게이션">
      {/* 이전 */}
      <Link
        href={buildHref(currentPage - 1)}
        aria-disabled={currentPage <= 1}
        className={cn(
          'flex items-center justify-center h-8 w-8 rounded-md text-sm transition-colors',
          currentPage <= 1
            ? 'pointer-events-none text-muted-foreground opacity-50'
            : 'text-foreground hover:bg-accent/50'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {/* 첫 페이지 + 생략 */}
      {range[0] > 1 && (
        <>
          <Link href={buildHref(1)} className={pageButtonClass(1 === currentPage)}>
            1
          </Link>
          {range[0] > 2 && (
            <span className="flex items-center justify-center h-8 w-8 text-sm text-muted-foreground">
              …
            </span>
          )}
        </>
      )}

      {range.map((page) => (
        <Link
          key={page}
          href={buildHref(page)}
          className={pageButtonClass(page === currentPage)}
        >
          {page}
        </Link>
      ))}

      {/* 생략 + 마지막 페이지 */}
      {range[range.length - 1] < totalPages && (
        <>
          {range[range.length - 1] < totalPages - 1 && (
            <span className="flex items-center justify-center h-8 w-8 text-sm text-muted-foreground">
              …
            </span>
          )}
          <Link
            href={buildHref(totalPages)}
            className={pageButtonClass(totalPages === currentPage)}
          >
            {totalPages}
          </Link>
        </>
      )}

      {/* 다음 */}
      <Link
        href={buildHref(currentPage + 1)}
        aria-disabled={currentPage >= totalPages}
        className={cn(
          'flex items-center justify-center h-8 w-8 rounded-md text-sm transition-colors',
          currentPage >= totalPages
            ? 'pointer-events-none text-muted-foreground opacity-50'
            : 'text-foreground hover:bg-accent/50'
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  )
}

function pageButtonClass(isActive: boolean) {
  return cn(
    'flex items-center justify-center h-8 w-8 rounded-md text-sm transition-colors',
    isActive
      ? 'bg-primary text-primary-foreground font-medium'
      : 'text-foreground hover:bg-accent/50'
  )
}
