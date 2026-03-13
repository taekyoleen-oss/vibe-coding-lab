import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSetting } from '@/lib/supabase/queries/settings'
import { refineAppContent } from '@/lib/ai/refine'
import { aiLimit, checkRateLimit, getIp } from '@/lib/utils/rate-limit'

// POST /api/ai/refine-app — rate limited at 3/min, AI 글 다듬기
export async function POST(req: NextRequest) {
  // Check if AI feature is enabled
  try {
    const supabase = await createSupabaseServerClient()
    const enabled = await getSetting(supabase, 'ai_refine_enabled')
    if (enabled !== 'true') {
      return NextResponse.json({ error: 'AI 기능이 현재 비활성화되어 있습니다' }, { status: 503 })
    }
  } catch (err) {
    console.error('[POST /api/ai/refine-app] Settings check error:', err)
    return NextResponse.json({ error: 'AI 기능 상태를 확인할 수 없습니다' }, { status: 500 })
  }

  // Rate limit
  try {
    await checkRateLimit(aiLimit, getIp(req))
  } catch {
    return NextResponse.json({ error: 'AI 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { title, description } = body

    if (!title || !description) {
      return NextResponse.json({ error: '제목과 설명은 필수입니다' }, { status: 400 })
    }

    const refined = await refineAppContent(body)
    return NextResponse.json({ data: refined })
  } catch (err) {
    console.error('[POST /api/ai/refine-app]', err)
    return NextResponse.json({ error: 'AI 처리에 실패했습니다' }, { status: 500 })
  }
}
