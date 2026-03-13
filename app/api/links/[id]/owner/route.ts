import { NextRequest, NextResponse } from 'next/server'
import { getOwnerSession } from '@/lib/auth/owner-session'
import { updateLink } from '@/lib/supabase/queries/links'

// PUT /api/links/[id]/owner — owner session auth
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const isOwner = getOwnerSession(req, 'link', id)
  if (!isOwner) {
    return NextResponse.json({ error: '소유권 인증이 필요합니다' }, { status: 401 })
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
