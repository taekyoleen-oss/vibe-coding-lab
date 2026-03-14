import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Eye, ExternalLink } from 'lucide-react'
import { StatusBadge } from '@/components/requests/StatusBadge'
import { RequestTypeBadge } from '@/components/requests/RequestTypeBadge'
import { LinkedAppMiniCard } from '@/components/requests/LinkedAppMiniCard'
import { CommentThread } from '@/components/requests/CommentThread'
import { MarkdownViewer } from '@/components/common/MarkdownViewer'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getRequest, incrementViewCount } from '@/lib/supabase/queries/requests'
import { getApp } from '@/lib/supabase/queries/apps'
import { getComments } from '@/lib/supabase/queries/comments'
import type { SafeVcRequestPost, SafeVcApp, CommentNode } from '@/output/step2_types'

interface PageProps {
  params: Promise<{ id: string }>
}

async function fetchRequest(id: string): Promise<SafeVcRequestPost | null> {
  try {
    const supabase = await createSupabaseServerClient()
    return await getRequest(supabase, id)
  } catch {
    return null
  }
}

async function getLinkedApp(
  appId: string
): Promise<Pick<SafeVcApp, 'id' | 'title' | 'level' | 'screenshot_url'> | null> {
  try {
    const supabase = await createSupabaseServerClient()
    return await getApp(supabase, appId)
  } catch {
    return null
  }
}

async function fetchComments(postId: string): Promise<CommentNode[]> {
  try {
    const supabase = await createSupabaseServerClient()
    return await getComments(supabase, postId)
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const request = await fetchRequest(id)
  if (!request) return { title: '요청을 찾을 수 없습니다' }

  return {
    title: `${request.title} — 비개발자의 개발실`,
    description: request.content.slice(0, 120),
  }
}

export default async function RequestDetailPage({ params }: PageProps) {
  const { id } = await params
  const request = await fetchRequest(id)
  if (!request) notFound()

  const [linkedApp, comments] = await Promise.all([
    request.linked_app_id ? getLinkedApp(request.linked_app_id) : null,
    fetchComments(id),
  ])

  // 조회수 증가 (fire-and-forget)
  incrementViewCount(id).catch(() => null)

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* 뒤로가기 */}
      <Link
        href="/requests"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-flex items-center gap-1"
      >
        ← 목록으로
      </Link>

      {/* 헤더 */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={request.status} />
          <RequestTypeBadge type={request.request_type} />
        </div>

        <h1 className="text-2xl font-bold text-foreground">{request.title}</h1>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{request.author_nickname}</span>
          <span>·</span>
          <span>
            {new Date(request.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {request.view_count > 0 && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-0.5">
                <Eye className="h-3 w-3" />
                {request.view_count}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 연결된 앱 */}
      {linkedApp && (
        <div className="mb-6 p-3 rounded-lg border border-border bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            연결된 앱
          </p>
          <Link href={`/apps/${linkedApp.id}`}>
            <LinkedAppMiniCard app={linkedApp} />
          </Link>
        </div>
      )}

      {/* 본문 */}
      <div className="mb-8">
        <MarkdownViewer content={request.content} />
      </div>

      <hr className="border-border mb-8" />

      {/* 댓글 스레드 */}
      <CommentThread postId={id} initialComments={comments} />
    </div>
  )
}
