import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AdminLoginForm } from '@/components/admin/AdminLoginForm'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import type { SafeVcApp, SafeVcRequestPost, SafeVcInfoCard, VcLink, VcAdminSettings } from '@/output/step2_types'

export const metadata: Metadata = {
  title: '관리자 — 비개발자의 개발실',
  robots: 'noindex, nofollow',
}

async function fetchAll(baseUrl: string) {
  const [appsRes, requestsRes, infoRes, linksRes, settingsRes] = await Promise.allSettled([
    fetch(`${baseUrl}/api/apps?page_size=100`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/requests?page_size=100`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/info?page_size=100`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/links?page_size=100`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/admin/settings`, { cache: 'no-store' }),
  ])

  async function toData<T>(result: PromiseSettledResult<Response>, key = 'data'): Promise<T[]> {
    if (result.status !== 'fulfilled' || !result.value.ok) return []
    const json = await result.value.json()
    return json[key] ?? []
  }

  const [apps, requests, infoCards, links, settingsRaw] = await Promise.all([
    toData<SafeVcApp>(appsRes),
    toData<SafeVcRequestPost>(requestsRes),
    toData<SafeVcInfoCard>(infoRes),
    toData<VcLink>(linksRes),
    toData<VcAdminSettings>(settingsRes),
  ])

  return { apps, requests, infoCards, links, settings: settingsRaw }
}

export default async function AdminPage() {
  // 관리자 세션 확인
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdmin = user?.id === process.env.ADMIN_USER_ID

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <AdminLoginForm />
      </div>
    )
  }

  // 관리자 데이터 패칭
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const { apps, requests, infoCards, links, settings } = await fetchAll(baseUrl)

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <AdminDashboard
        apps={apps}
        requests={requests}
        infoCards={infoCards}
        links={links}
        settings={settings}
      />
    </div>
  )
}
