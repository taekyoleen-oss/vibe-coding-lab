import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LevelBadge } from '@/components/apps/LevelBadge'
import { AppRequestButton } from '@/components/apps/AppRequestButton'
import { AppRequestList } from '@/components/apps/AppRequestList'
import { MarkdownViewer } from '@/components/common/MarkdownViewer'
import { EditOwnerGate } from '@/components/ownership/EditOwnerGate'
import { OwnerEditForm } from '@/components/ownership/OwnerEditForm'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getApp } from '@/lib/supabase/queries/apps'
import { getRequests } from '@/lib/supabase/queries/requests'
import type { SafeVcApp, SafeVcRequestPost } from '@/output/step2_types'

interface PageProps {
  params: Promise<{ id: string }>
}

async function fetchApp(id: string): Promise<SafeVcApp | null> {
  try {
    const supabase = await createSupabaseServerClient()
    return await getApp(supabase, id)
  } catch {
    return null
  }
}

async function getAppRequests(appId: string): Promise<SafeVcRequestPost[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const result = await getRequests(supabase, { linked_app_id: appId, page: 1 })
    return result.data
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const app = await fetchApp(id)
  if (!app) return { title: '앱을 찾을 수 없습니다' }

  return {
    title: `${app.title} — 비개발자의 개발실`,
    description: app.description,
    openGraph: {
      title: app.title,
      description: app.description,
      images: app.screenshot_url ? [{ url: app.screenshot_url }] : [],
      type: 'website',
    },
  }
}

export default async function AppDetailPage({ params }: PageProps) {
  const { id } = await params
  const [app, requests] = await Promise.all([fetchApp(id), getAppRequests(id)])

  if (!app) notFound()

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* 헤더 */}
      <div className="space-y-4 mb-8">
        {app.screenshot_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={app.screenshot_url}
            alt={`${app.title} 스크린샷`}
            className="w-full max-h-80 object-cover rounded-xl border border-border"
          />
        )}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">{app.title}</h1>
            <p className="text-muted-foreground text-sm">{app.description}</p>
          </div>
          {app.level && <LevelBadge level={app.level} />}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={app.app_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            앱 열기
          </a>
          <AppRequestButton appId={app.id} appTitle={app.title} />
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>by {app.author_nickname}</span>
          {app.vibe_tool && (
            <>
              <span>·</span>
              <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary-foreground border border-secondary/30">
                {app.vibe_tool}
              </span>
            </>
          )}
          {app.uses_api_key && (
            <>
              <span>·</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                API키 필요
              </span>
            </>
          )}
          <span>·</span>
          <span>{new Date(app.created_at).toLocaleDateString('ko-KR')}</span>
        </div>
      </div>

      {/* 탭 */}
      <Tabs defaultValue="info">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-0">
          <TabsTrigger
            value="info"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"
          >
            기본정보
          </TabsTrigger>
          {app.initial_prompt && (
            <TabsTrigger
              value="prompt"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"
            >
              프롬프트
            </TabsTrigger>
          )}
          {app.markdown_content && (
            <TabsTrigger
              value="markdown"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"
            >
              마크다운 설명
            </TabsTrigger>
          )}
          <TabsTrigger
            value="requests"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm"
          >
            이 앱의 요청 {requests.length}건
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6 space-y-3">
          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <p className="text-sm"><span className="font-medium">레벨: </span>{app.level ?? '미지정'}</p>
            <p className="text-sm"><span className="font-medium">AI 도구: </span>{app.vibe_tool ?? '미지정'}</p>
            <p className="text-sm"><span className="font-medium">API 키 필요: </span>{app.uses_api_key ? '예' : '아니오'}</p>
            <p className="text-sm"><span className="font-medium">등록일: </span>{new Date(app.created_at).toLocaleDateString('ko-KR')}</p>
          </div>
        </TabsContent>

        {app.initial_prompt && (
          <TabsContent value="prompt" className="mt-6">
            <pre className="font-mono text-sm bg-muted p-4 rounded-md overflow-auto whitespace-pre-wrap leading-relaxed">
              {app.initial_prompt}
            </pre>
          </TabsContent>
        )}

        {app.markdown_content && (
          <TabsContent value="markdown" className="mt-6">
            <MarkdownViewer content={app.markdown_content} />
          </TabsContent>
        )}

        <TabsContent value="requests" className="mt-6">
          <AppRequestList requests={requests} />
        </TabsContent>
      </Tabs>

      {/* 수정 섹션 */}
      <div className="mt-12 pt-8 border-t border-border">
        <h2 className="text-base font-semibold text-foreground mb-4">앱 수정</h2>
        <EditOwnerGate contentType="app" contentId={app.id} authorId={app.author_id ?? null}>
          <OwnerEditForm contentType="app" content={app} />
        </EditOwnerGate>
      </div>
    </div>
  )
}
