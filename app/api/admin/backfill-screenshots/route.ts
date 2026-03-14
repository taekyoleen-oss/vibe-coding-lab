import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'
import { captureScreenshot } from '@/lib/utils/screenshot'
import { fetchOgImage } from '@/lib/utils/og-fetch'

// POST /api/admin/backfill-screenshots — 관리자 전용
// screenshot_url이 없는 기존 앱들에 OG 이미지를 자동 추출해 저장
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const limit = Math.min(Number(body.limit ?? 50), 200) // 한 번에 최대 200개

  // screenshot_url이 없는 앱 목록 조회
  const service = createSupabaseServiceClient()
  const { data: apps, error } = await service
    .from('vc_apps')
    .select('id, app_url')
    .is('screenshot_url', null)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: '앱 목록 조회 실패' }, { status: 500 })
  }

  if (!apps || apps.length === 0) {
    return NextResponse.json({ message: '처리할 앱이 없습니다', updated: 0 })
  }

  let updated = 0
  let failed = 0
  const results: { id: string; url: string; status: 'ok' | 'skip' | 'error' }[] = []

  for (const app of apps) {
    try {
      // 실제 스크린샷 캡처 시도 → 실패 시 OG 이미지 fallback
      const imageUrl = (await captureScreenshot(app.app_url)) ?? (await fetchOgImage(app.app_url))
      if (imageUrl) {
        const { error: updateError } = await service
          .from('vc_apps')
          .update({ screenshot_url: imageUrl })
          .eq('id', app.id)
        if (!updateError) {
          updated++
          results.push({ id: app.id, url: imageUrl, status: 'ok' })
        } else {
          failed++
          results.push({ id: app.id, url: '', status: 'error' })
        }
      } else {
        results.push({ id: app.id, url: '', status: 'skip' })
      }
    } catch {
      failed++
      results.push({ id: app.id, url: '', status: 'error' })
    }
  }

  return NextResponse.json({
    message: `총 ${apps.length}개 처리: ${updated}개 업데이트, ${failed}개 실패`,
    total: apps.length,
    updated,
    failed,
    results,
  })
}
