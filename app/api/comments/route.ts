import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createComment } from '@/lib/supabase/queries/comments'
import { generalLimit, checkRateLimit, getIp } from '@/lib/utils/rate-limit'

// POST /api/comments — 로그인 필요, depth 검증
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
    const { post_id, content, author_nickname } = body

    if (!post_id || !content || !author_nickname) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요' }, { status: 400 })
    }

    body.author_id = user.id

    const comment = await createComment(supabase, body)
    return NextResponse.json({ data: comment }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message === 'MAX_DEPTH') {
      return NextResponse.json({ error: '댓글은 최대 2단계까지 가능합니다' }, { status: 400 })
    }
    console.error('[POST /api/comments]', err)
    return NextResponse.json({ error: '댓글 등록에 실패했습니다' }, { status: 500 })
  }
}
