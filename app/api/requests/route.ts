import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getRequests, createRequest } from '@/lib/supabase/queries/requests'
import { generalLimit, checkRateLimit, getIp } from '@/lib/utils/rate-limit'
import type { RequestSearchParams, RequestStatus, RequestType } from '@/output/step2_types'

// GET /api/requests — public
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const params: RequestSearchParams = {
      q: searchParams.get('q') ?? undefined,
      status: (searchParams.get('status') as RequestStatus) ?? undefined,
      request_type: (searchParams.get('request_type') as RequestType) ?? undefined,
      linked_app_id: searchParams.get('linked_app_id') ?? undefined,
      page: Number(searchParams.get('page') ?? '1'),
    }

    const supabase = await createSupabaseServerClient()
    const result = await getRequests(supabase, params)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[GET /api/requests]', err)
    return NextResponse.json({ error: '요청 목록을 불러올 수 없습니다' }, { status: 500 })
  }
}

// POST /api/requests — public with rate limit
export async function POST(req: NextRequest) {
  try {
    await checkRateLimit(generalLimit, getIp(req))
  } catch {
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { title, content, author_nickname } = body

    if (!title || !content || !author_nickname) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()
    const result = await createRequest(supabase, body)
    return NextResponse.json({ data: result }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/requests]', err)
    return NextResponse.json({ error: '요청 등록에 실패했습니다' }, { status: 500 })
  }
}
