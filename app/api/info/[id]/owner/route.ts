import { NextRequest, NextResponse } from 'next/server'
import { getOwnerSession } from '@/lib/auth/owner-session'
import { updateInfoCard } from '@/lib/supabase/queries/info'

// PUT /api/info/[id]/owner — owner session auth
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const isOwner = getOwnerSession(req, 'info', id)
  if (!isOwner) {
    return NextResponse.json({ error: '소유권 인증이 필요합니다' }, { status: 401 })
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
