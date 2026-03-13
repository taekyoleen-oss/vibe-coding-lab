import Link from 'next/link'
import { HeroSection } from '@/components/home/HeroSection'
import { AppCard } from '@/components/apps/AppCard'
import type { SafeVcApp } from '@/output/step2_types'

async function getLatestApps(): Promise<SafeVcApp[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/apps?page=1`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const json = await res.json()
    return (json.data ?? []).slice(0, 4)
  } catch {
    return []
  }
}

export default async function HomePage() {
  const latestApps = await getLatestApps()

  return (
    <div>
      <HeroSection />

      {/* 최신 앱 섹션 */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">최신 등록 앱</h2>
          <Link
            href="/apps"
            className="text-sm text-primary hover:underline underline-offset-4"
          >
            전체 보기
          </Link>
        </div>

        {latestApps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {latestApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">아직 등록된 앱이 없습니다.</p>
            <Link
              href="/apps/new"
              className="mt-3 inline-block text-sm text-primary hover:underline underline-offset-4"
            >
              첫 번째 앱을 등록해 보세요
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
