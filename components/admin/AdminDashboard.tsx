'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutGrid, MessageSquare, BookOpen, Link2, Settings, LogOut } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminSettingsTab } from './AdminSettingsTab'
import type { SafeVcApp, SafeVcRequestPost, SafeVcInfoCard, VcLink, VcAdminSettings } from '@/output/step2_types'

// ─── 관리자 앱 탭 ──────────────────────────────────────────────────────────────

function AppsTab({ apps }: { apps: SafeVcApp[] }) {
  const router = useRouter()

  async function toggleHidden(id: string, current: boolean) {
    const res = await fetch(`/api/apps/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_hidden: !current }),
    })
    if (res.ok) router.refresh()
    else alert('처리에 실패했습니다.')
  }

  return (
    <div className="space-y-3">
      {apps.length === 0 && <p className="text-sm text-muted-foreground">등록된 앱이 없습니다.</p>}
      {apps.map((app) => (
        <div
          key={app.id}
          className={`flex items-center justify-between gap-4 rounded-lg border p-3 transition-opacity ${
            app.is_hidden ? 'opacity-50 border-dashed' : 'border-border'
          }`}
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{app.title}</p>
            <p className="text-xs text-muted-foreground truncate">{app.description}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              by {app.author_nickname} · {new Date(app.created_at).toLocaleDateString('ko-KR')}
            </p>
          </div>
          <button
            onClick={() => toggleHidden(app.id, app.is_hidden)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-md border transition-colors ${
              app.is_hidden
                ? 'border-green-300 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950'
                : 'border-destructive/40 text-destructive hover:bg-destructive/10'
            }`}
          >
            {app.is_hidden ? '숨김 해제' : '숨기기'}
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── 관리자 요청/댓글 탭 ────────────────────────────────────────────────────────

function RequestsTab({ requests }: { requests: SafeVcRequestPost[] }) {
  const router = useRouter()

  async function toggleHidden(id: string, current: boolean) {
    const res = await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_hidden: !current }),
    })
    if (res.ok) router.refresh()
    else alert('처리에 실패했습니다.')
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) router.refresh()
    else alert('상태 변경에 실패했습니다.')
  }

  return (
    <div className="space-y-3">
      {requests.length === 0 && (
        <p className="text-sm text-muted-foreground">등록된 요청이 없습니다.</p>
      )}
      {requests.map((req) => (
        <div
          key={req.id}
          className={`rounded-lg border p-3 transition-opacity ${
            req.is_hidden ? 'opacity-50 border-dashed' : 'border-border'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{req.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                by {req.author_nickname} · {new Date(req.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={req.status}
                onChange={(e) => updateStatus(req.id, e.target.value)}
                className="text-xs rounded border border-border bg-background px-2 py-1"
              >
                <option value="requested">요청됨</option>
                <option value="in_progress">진행중</option>
                <option value="completed">완료</option>
                <option value="closed">닫힘</option>
              </select>
              <button
                onClick={() => toggleHidden(req.id, req.is_hidden)}
                className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                  req.is_hidden
                    ? 'border-green-300 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950'
                    : 'border-destructive/40 text-destructive hover:bg-destructive/10'
                }`}
              >
                {req.is_hidden ? '숨김 해제' : '숨기기'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── 관리자 정보공유 탭 ────────────────────────────────────────────────────────

function InfoTab({ cards }: { cards: SafeVcInfoCard[] }) {
  const router = useRouter()

  async function toggleHidden(id: string, current: boolean) {
    const res = await fetch(`/api/info/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_hidden: !current }),
    })
    if (res.ok) router.refresh()
    else alert('처리에 실패했습니다.')
  }

  return (
    <div className="space-y-3">
      {cards.length === 0 && (
        <p className="text-sm text-muted-foreground">등록된 정보 카드가 없습니다.</p>
      )}
      {cards.map((card) => (
        <div
          key={card.id}
          className={`flex items-center justify-between gap-4 rounded-lg border p-3 transition-opacity ${
            card.is_hidden ? 'opacity-50 border-dashed' : 'border-border'
          }`}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {card.content_type === 'slides' ? '슬라이드' : '마크다운'}
              </span>
              <p className="text-sm font-medium text-foreground truncate">{card.title}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              by {card.author_nickname} · {new Date(card.created_at).toLocaleDateString('ko-KR')}
            </p>
          </div>
          <button
            onClick={() => toggleHidden(card.id, card.is_hidden)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-md border transition-colors ${
              card.is_hidden
                ? 'border-green-300 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950'
                : 'border-destructive/40 text-destructive hover:bg-destructive/10'
            }`}
          >
            {card.is_hidden ? '숨김 해제' : '숨기기'}
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── 관리자 링크 탭 ────────────────────────────────────────────────────────────

function LinksTab({ links }: { links: VcLink[] }) {
  const router = useRouter()

  async function toggleHidden(id: string, current: boolean) {
    const res = await fetch(`/api/links/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_hidden: !current }),
    })
    if (res.ok) router.refresh()
    else alert('처리에 실패했습니다.')
  }

  return (
    <div className="space-y-3">
      {links.length === 0 && (
        <p className="text-sm text-muted-foreground">등록된 링크가 없습니다.</p>
      )}
      {links.map((link) => (
        <div
          key={link.id}
          className={`flex items-center justify-between gap-4 rounded-lg border p-3 transition-opacity ${
            link.is_hidden ? 'opacity-50 border-dashed' : 'border-border'
          }`}
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{link.title}</p>
            <p className="text-xs text-muted-foreground truncate">{link.url}</p>
          </div>
          <button
            onClick={() => toggleHidden(link.id, link.is_hidden)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-md border transition-colors ${
              link.is_hidden
                ? 'border-green-300 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950'
                : 'border-destructive/40 text-destructive hover:bg-destructive/10'
            }`}
          >
            {link.is_hidden ? '숨김 해제' : '숨기기'}
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── 메인 대시보드 ─────────────────────────────────────────────────────────────

interface AdminDashboardProps {
  apps: SafeVcApp[]
  requests: SafeVcRequestPost[]
  infoCards: SafeVcInfoCard[]
  links: VcLink[]
  settings: VcAdminSettings[]
}

export function AdminDashboard({
  apps,
  requests,
  infoCards,
  links,
  settings,
}: AdminDashboardProps) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' })
      router.refresh()
    } catch {
      setLoggingOut(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">관리자 대시보드</h1>
          <p className="text-sm text-muted-foreground">비개발자의 개발실</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          {loggingOut ? '로그아웃 중...' : '로그아웃'}
        </button>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '앱', count: apps.length, hidden: apps.filter((a) => a.is_hidden).length },
          { label: '요청', count: requests.length, hidden: requests.filter((r) => r.is_hidden).length },
          { label: '정보', count: infoCards.length, hidden: infoCards.filter((c) => c.is_hidden).length },
          { label: '링크', count: links.length, hidden: links.filter((l) => l.is_hidden).length },
        ].map(({ label, count, hidden }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{count}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            {hidden > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">{hidden}개 숨김</p>
            )}
          </div>
        ))}
      </div>

      {/* 5탭 */}
      <Tabs defaultValue="apps">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-0 flex-wrap">
          {[
            { value: 'apps', label: '앱 관리', icon: <LayoutGrid className="h-3.5 w-3.5" /> },
            { value: 'requests', label: '요청·댓글', icon: <MessageSquare className="h-3.5 w-3.5" /> },
            { value: 'info', label: '정보 공유', icon: <BookOpen className="h-3.5 w-3.5" /> },
            { value: 'links', label: '참고 링크', icon: <Link2 className="h-3.5 w-3.5" /> },
            { value: 'settings', label: '⚙️ 설정', icon: <Settings className="h-3.5 w-3.5" /> },
          ].map(({ value, label, icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs inline-flex items-center gap-1.5"
            >
              {icon}
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="apps" className="mt-4">
          <AppsTab apps={apps} />
        </TabsContent>
        <TabsContent value="requests" className="mt-4">
          <RequestsTab requests={requests} />
        </TabsContent>
        <TabsContent value="info" className="mt-4">
          <InfoTab cards={infoCards} />
        </TabsContent>
        <TabsContent value="links" className="mt-4">
          <LinksTab links={links} />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <AdminSettingsTab settings={settings} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
