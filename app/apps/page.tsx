import { Suspense } from 'react'
import Link from 'next/link'
import { AppGrid } from '@/components/apps/AppGrid'
import { AppSearchBar } from '@/components/apps/AppSearchBar'
import { AppFilterChips } from '@/components/apps/AppFilterChips'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getApps } from '@/lib/supabase/queries/apps'
import type { AppSearchParams, AppListResponse } from '@/output/step2_types'

interface PageProps {
  searchParams: Promise<AppSearchParams & { page?: string }>
}

async function fetchApps(params: AppSearchParams): Promise<AppListResponse> {
  try {
    const supabase = await createSupabaseServerClient()
    return await getApps(supabase, params)
  } catch {
    return { data: [], total: 0, page: 1, pageSize: 12 }
  }
}

export default async function AppsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = Number(sp.page) || 1
  const result = await fetchApps({ ...sp, page })

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">개발앱</h1>
        <Link
          href="/apps/new"
          className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          앱 등록하기
        </Link>
      </div>

      <div className="space-y-4 mb-8">
        <Suspense>
          <AppSearchBar />
        </Suspense>
        <Suspense>
          <AppFilterChips />
        </Suspense>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        총 {result.total}개의 앱
      </p>

      <Suspense fallback={<div className="text-sm text-muted-foreground">로딩 중...</div>}>
        <AppGrid
          apps={result.data}
          total={result.total}
          currentPage={page}
          pageSize={result.pageSize}
          searchQuery={sp.q}
        />
      </Suspense>
    </div>
  )
}
