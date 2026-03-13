import { NextRequest, NextResponse } from 'next/server'
import { softDeleteLink } from '@/lib/supabase/queries/links'
import { verifyAdminSession } from '@/lib/utils/admin-auth'

// DELETE /api/links/[id] — admin only (soft delete)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    await softDeleteLink(id)
    return NextResponse.json({ message: '삭제되었습니다' })
  } catch (err) {
    console.error('[DELETE /api/links/[id]]', err)
    return NextResponse.json({ error: '링크 삭제에 실패했습니다' }, { status: 500 })
  }
}
