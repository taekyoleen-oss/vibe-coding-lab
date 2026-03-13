import { NextRequest, NextResponse } from 'next/server'
import { getOwnerSession } from '@/lib/auth/owner-session'
import { updateRequest } from '@/lib/supabase/queries/requests'

// PUT /api/requests/[id]/owner — owner session auth
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const isOwner = getOwnerSession(req, 'request', id)
  if (!isOwner) {
    return NextResponse.json({ error: '소유권 인증이 필요합니다' }, { status: 401 })
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
