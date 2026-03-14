import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { updateRequest } from '@/lib/supabase/queries/requests'

// PUT /api/requests/[id]/owner — 로그인 + 소유자(또는 관리자) 인증
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { data: post } = await supabase
    .from('vc_request_posts')
    .select('author_id')
    .eq('id', id)
    .single()

  const isAdmin = user.id === process.env.ADMIN_USER_ID
  const isOwner = post?.author_id && user.id === post.author_id

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: '수정 권한이 없습니다' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { title, content, request_type, linked_app_id } = body
    await updateRequest(id, { title, content, request_type, linked_app_id })
    return NextResponse.json({ message: '수정되었습니다' })
  } catch (err) {
    console.error('[PUT /api/requests/[id]/owner]', err)
    return NextResponse.json({ error: '요청 수정에 실패했습니다' }, { status: 500 })
  }
}
