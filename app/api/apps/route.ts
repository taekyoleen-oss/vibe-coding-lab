import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getApps, createApp } from '@/lib/supabase/queries/apps'
import { generalLimit, checkRateLimit, getIp } from '@/lib/utils/rate-limit'
import { fetchOgImage } from '@/lib/utils/og-fetch'
import { captureScreenshot } from '@/lib/utils/screenshot'
import type { AppSearchParams, AppLevel, VibeTool } from '@/output/step2_types'

// GET /api/apps — public, FTS + filter + pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const params: AppSearchParams = {
      q: searchParams.get('q') ?? undefined,
      level: (searchParams.get('level') as AppLevel) ?? undefined,
      uses_api_key:
        searchParams.get('uses_api_key') === 'false'
          ? false
          : searchParams.get('uses_api_key') === 'true'
            ? true
            : undefined,
      tool: (searchParams.get('tool') as VibeTool) ?? undefined,
      page: Number(searchParams.get('page') ?? '1'),
    }

    const supabase = await createSupabaseServerClient()
    const result = await getApps(supabase, params)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[GET /api/apps]', err)
    return NextResponse.json({ error: '앱 목록을 불러올 수 없습니다' }, { status: 500 })
  }
}

// POST /api/apps — 로그인 필요
export async function POST(req: NextRequest) {
  try {
    await checkRateLimit(generalLimit, getIp(req))
  } catch {
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 })
  }

  try {
    const supabase = await createSupabaseServerClient()

    // 인증 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, app_url, uses_api_key, author_nickname } = body

    if (!title || !description || !app_url || !author_nickname) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요' }, { status: 400 })
    }

    // 작성자 ID 자동 주입
    body.author_id = user.id

    // 스크린샷 없으면 실제 화면 캡처 시도 → 실패 시 OG 이미지 fallback
    if (!body.screenshot_url && body.app_url) {
      const captured = await captureScreenshot(body.app_url)
      if (captured) {
        body.screenshot_url = captured
      } else {
        const ogImage = await fetchOgImage(body.app_url)
        if (ogImage) body.screenshot_url = ogImage
      }
    }

    const result = await createApp(supabase, body)
    return NextResponse.json({ data: result }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/apps]', err)
    return NextResponse.json({ error: '앱 등록에 실패했습니다' }, { status: 500 })
  }
}
