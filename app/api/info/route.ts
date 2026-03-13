import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getInfoCards, createInfoCard } from '@/lib/supabase/queries/info'
import { generalLimit, checkRateLimit, getIp } from '@/lib/utils/rate-limit'

// GET /api/info — public
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const cards = await getInfoCards(supabase)
    return NextResponse.json({ data: cards })
  } catch (err) {
    console.error('[GET /api/info]', err)
    return NextResponse.json({ error: '정보 카드를 불러올 수 없습니다' }, { status: 500 })
  }
}

// POST /api/info — public with rate limit
export async function POST(req: NextRequest) {
  try {
    await checkRateLimit(generalLimit, getIp(req))
  } catch {
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { title, content_type, author_nickname } = body

    if (!title || !content_type || !author_nickname) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()
    const result = await createInfoCard(supabase, body)
    return NextResponse.json({ data: result }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/info]', err)
    return NextResponse.json({ error: '정보 카드 등록에 실패했습니다' }, { status: 500 })
  }
}
