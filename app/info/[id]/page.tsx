import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Images, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SlideViewer } from '@/components/info/SlideViewer'
import { MarkdownViewer } from '@/components/common/MarkdownViewer'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getInfoCard } from '@/lib/supabase/queries/info'
import type { VcInfoCardWithSlides } from '@/output/step2_types'

interface PageProps {
  params: Promise<{ id: string }>
}

async function fetchInfoCard(id: string): Promise<VcInfoCardWithSlides | null> {
  try {
    const supabase = await createSupabaseServerClient()
    return await getInfoCard(supabase, id)
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const card = await fetchInfoCard(id)
  if (!card) return { title: '정보를 찾을 수 없습니다' }

  return {
    title: `${card.title} — 비개발자의 개발실`,
    description: card.summary ?? `${card.author_nickname}이 공유한 정보입니다.`,
  }
}

export default async function InfoDetailPage({ params }: PageProps) {
  const { id } = await params
  const card = await fetchInfoCard(id)
  if (!card) notFound()

  const isSlides = card.content_type === 'slides'

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* 뒤로가기 */}
      <Link
        href="/info"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-flex items-center gap-1"
      >
        ← 목록으로
      </Link>

      {/* 헤더 */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-2">
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

        <h1 className="text-2xl font-bold text-foreground">{card.title}</h1>

        {card.summary && (
          <p className="text-muted-foreground text-sm">{card.summary}</p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{card.author_nickname}</span>
          <span>·</span>
          <span>
            {new Date(card.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* 콘텐츠 */}
      {isSlides ? (
        <SlideViewer slides={card.slides} />
      ) : card.markdown_content ? (
        <MarkdownViewer content={card.markdown_content} />
      ) : (
        <p className="text-sm text-muted-foreground">내용이 없습니다.</p>
      )}
    </div>
  )
}
