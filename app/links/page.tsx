import { Suspense } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { LinkCard } from '@/components/links/LinkCard'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getLinks } from '@/lib/supabase/queries/links'
import type { VcLink, LinkCategory } from '@/output/step2_types'

export const metadata: Metadata = {
  title: '참고 링크 — 비개발자의 개발실',
  description: '바이브 코딩에 유용한 도구, 문서, 커뮤니티 링크 모음입니다.',
}

const CATEGORIES: { value: LinkCategory | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'tool', label: '도구' },
  { value: 'document', label: '문서' },
  { value: 'community', label: '커뮤니티' },
  { value: 'video', label: '영상' },
  { value: 'other', label: '기타' },
]

interface PageProps {
  searchParams: Promise<{ category?: string }>
}

async function fetchLinks(category?: string): Promise<VcLink[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const all = await getLinks(supabase)
    if (!category || category === 'all') return all
    return all.filter((l) => l.category === category)
  } catch {
    return []
  }
}

export default async function LinksPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const category = sp.category ?? 'all'
  const links = await fetchLinks(category)

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">참고 링크</h1>
          <p className="text-sm text-muted-foreground mt-1">
            바이브 코딩에 유용한 도구, 문서, 커뮤니티를 모았습니다.
          </p>
        </div>
        <Link
          href="/links/new"
          className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          링크 추가
        </Link>
      </div>

      {/* 카테고리 필터 탭 */}
      <div className="flex gap-1 flex-wrap mb-6">
        {CATEGORIES.map(({ value, label }) => (
          <Link
            key={value}
            href={value === 'all' ? '/links' : `/links?category=${value}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              category === value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mb-4">총 {links.length}개의 링크</p>

      <Suspense fallback={<div className="text-sm text-muted-foreground">로딩 중...</div>}>
        {links.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">이 카테고리에 등록된 링크가 없습니다.</p>
            <Link
              href="/links/new"
              className="mt-3 inline-block text-sm text-primary underline underline-offset-2"
            >
              링크 추가하기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        )}
      </Suspense>
    </div>
  )
}
