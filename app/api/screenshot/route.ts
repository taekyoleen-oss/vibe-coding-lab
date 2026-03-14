import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { captureScreenshot } from '@/lib/utils/screenshot'

// Vercel 함수 최대 실행 시간 (초) — Hobby: 최대 60s
export const maxDuration = 60

const LOCAL_PATTERNS = /^https?:\/\/(localhost|127\.|0\.0\.0\.0|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/

// POST /api/screenshot — 로그인 필요
// body: { url: string }
// → thum.io로 캡처 → Supabase Storage 업로드 → public URL 반환
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { url } = await req.json().catch(() => ({}))
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url이 필요합니다' }, { status: 400 })
  }

  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: '유효하지 않은 URL입니다' }, { status: 400 })
  }

  // 로컬 URL 감지 — thum.io가 localhost에 접근 불가
  if (LOCAL_PATTERNS.test(url)) {
    return NextResponse.json(
      { error: 'LOCAL_URL', message: '로컬 URL은 자동 캡처가 불가능합니다. 배포 후 사용하거나 직접 업로드해 주세요.' },
      { status: 422 }
    )
  }

  const result = await captureScreenshot(url)
  if (!result.url) {
    return NextResponse.json({ error: `스크린샷 캡처 실패: ${result.reason}` }, { status: 500 })
  }

  return NextResponse.json({ screenshotUrl: result.url })
}
