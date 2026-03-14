import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { updateLink } from '@/lib/supabase/queries/links'

// PUT /api/links/[id]/owner — 로그인 + 소유자(또는 관리자) 인증
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { data: link } = await supabase
    .from('vc_links')
    .select('author_id')
    .eq('id', id)
    .single()

  const isAdmin = user.id === process.env.ADMIN_USER_ID
  const isOwner = link?.author_id && user.id === link.author_id

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: '수정 권한이 없습니다' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { title, description, url, category, icon_url, display_order } = body
    await updateLink(id, { title, description, url, category, icon_url, display_order })
    return NextResponse.json({ message: '수정되었습니다' })
  } catch (err) {
    console.error('[PUT /api/links/[id]/owner]', err)
    return NextResponse.json({ error: '링크 수정에 실패했습니다' }, { status: 500 })
  }
}
