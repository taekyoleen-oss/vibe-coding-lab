import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { updateInfoCard } from '@/lib/supabase/queries/info'

// PUT /api/info/[id]/owner — 로그인 + 소유자(또는 관리자) 인증
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { data: card } = await supabase
    .from('vc_info_cards')
    .select('author_id')
    .eq('id', id)
    .single()

  const isAdmin = user.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID
  const isOwner = card?.author_id && user.id === card.author_id

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: '수정 권한이 없습니다' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { title, summary, content_type, markdown_content, display_order } = body
    await updateInfoCard(id, { title, summary, content_type, markdown_content, display_order })
    return NextResponse.json({ message: '수정되었습니다' })
  } catch (err) {
    console.error('[PUT /api/info/[id]/owner]', err)
    return NextResponse.json({ error: '정보 카드 수정에 실패했습니다' }, { status: 500 })
  }
}
