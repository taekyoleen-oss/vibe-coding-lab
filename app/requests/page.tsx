import { Suspense } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { RequestPostCard } from '@/components/requests/RequestPostCard'
import { Pagination } from '@/components/common/Pagination'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getRequests } from '@/lib/supabase/queries/requests'
import type { RequestListResponse, RequestSearchParams } from '@/output/step2_types'

export const metadata: Metadata = {
  title: '개발요청 게시판 — 비개발자의 개발실',
  description: '앱 개발 요청, 피드백, 오류 신고 등을 남겨주세요.',
}

interface PageProps {
  searchParams: Promise<RequestSearchParams & { page?: string }>
}

async function fetchRequests(params: RequestSearchParams): Promise<RequestListResponse> {
  try {
    const supabase = await createSupabaseServerClient()
    return await getRequests(supabase, params)
  } catch {
    return { data: [], total: 0, page: 1, pageSize: 12 }
  }
}

export default async function RequestsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = Number(sp.page) || 1
  const result = await fetchRequests({ ...sp, page })

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">개발요청 게시판</h1>
        <Link
          href="/requests/new"
          className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          요청 작성
        </Link>
      </div>

      {/* 안내 */}
      <p className="text-sm text-muted-foreground mb-6">
        앱/기능 개발을 요청하거나 의견을 남기세요.
        운영 관련 문의는{' '}
        <Link href="/requests/contact" className="text-primary underline underline-offset-2">
          관리자에게 문의
        </Link>
        를 이용해 주세요.
      </p>

      {/* 총 건수 */}
      <p className="text-sm text-muted-foreground mb-4">총 {result.total}건의 요청</p>

      {/* 목록 */}
      <Suspense fallback={<div className="text-sm text-muted-foreground">로딩 중...</div>}>
        {result.data.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">아직 등록된 요청이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {result.data.map((request) => (
              <RequestPostCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </Suspense>

      <Pagination
        currentPage={page}
        totalItems={result.total}
        pageSize={result.pageSize}
      />
    </div>
  )
}
