import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getApps, createApp } from '@/lib/supabase/queries/apps'
import { generalLimit, checkRateLimit, getIp } from '@/lib/utils/rate-limit'
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

// POST /api/apps — public with rate limit
export async function POST(req: NextRequest) {
  try {
    await checkRateLimit(generalLimit, getIp(req))
  } catch {
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { title, description, app_url, uses_api_key, author_nickname } = body

    if (!title || !description || !app_url || !author_nickname) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()
    const result = await createApp(supabase, body)
    return NextResponse.json({ data: result }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/apps]', err)
    return NextResponse.json({ error: '앱 등록에 실패했습니다' }, { status: 500 })
  }
}
