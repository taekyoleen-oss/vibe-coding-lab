import { Suspense } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { InfoCard } from '@/components/info/InfoCard'
import { Pagination } from '@/components/common/Pagination'
import type { SafeVcInfoCard, PaginatedResponse } from '@/output/step2_types'

export const metadata: Metadata = {
  title: '정보 공유 — 비개발자의 개발실',
  description: '바이브 코딩 팁, 가이드, 노하우를 공유하는 공간입니다.',
}

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

async function getInfoCards(page: number): Promise<PaginatedResponse<SafeVcInfoCard>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/info?page=${page}`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) return { data: [], total: 0, page: 1, pageSize: 12 }
    return res.json()
  } catch {
    return { data: [], total: 0, page: 1, pageSize: 12 }
  }
}

export default async function InfoPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = Number(sp.page) || 1
  const result = await getInfoCards(page)

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">정보 공유</h1>
          <p className="text-sm text-muted-foreground mt-1">
            바이브 코딩 팁, 가이드, 노하우를 공유해 주세요.
          </p>
        </div>
        <Link
          href="/info/new"
          className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          글 작성
        </Link>
      </div>

      <p className="text-sm text-muted-foreground mb-4">총 {result.total}개의 정보</p>

      <Suspense fallback={<div className="text-sm text-muted-foreground">로딩 중...</div>}>
        {result.data.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">아직 등록된 정보가 없습니다.</p>
            <Link
              href="/info/new"
              className="mt-3 inline-block text-sm text-primary underline underline-offset-2"
            >
              첫 번째 정보 공유하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.data.map((card) => (
              <InfoCard key={card.id} card={card} />
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
