import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getLinks, createLink } from '@/lib/supabase/queries/links'
import { generalLimit, checkRateLimit, getIp } from '@/lib/utils/rate-limit'

// GET /api/links — public
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const links = await getLinks(supabase)
    return NextResponse.json({ data: links })
  } catch (err) {
    console.error('[GET /api/links]', err)
    return NextResponse.json({ error: '링크 목록을 불러올 수 없습니다' }, { status: 500 })
  }
}

// POST /api/links — public with rate limit
export async function POST(req: NextRequest) {
  try {
    await checkRateLimit(generalLimit, getIp(req))
  } catch {
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { title, url, author_nickname } = body

    if (!title || !url || !author_nickname) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()
    const result = await createLink(supabase, body)
    revalidatePath('/links')
    return NextResponse.json({ data: result }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/links]', err)
    return NextResponse.json({ error: '링크 등록에 실패했습니다' }, { status: 500 })
  }
}
