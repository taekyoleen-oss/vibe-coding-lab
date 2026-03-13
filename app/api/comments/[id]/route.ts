import { NextRequest, NextResponse } from 'next/server'
import { softDeleteComment } from '@/lib/supabase/queries/comments'
import { verifyAdminSession } from '@/lib/utils/admin-auth'

// DELETE /api/comments/[id] — admin only (soft delete)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    await softDeleteComment(id)
    return NextResponse.json({ message: '댓글이 삭제되었습니다' })
  } catch (err) {
    console.error('[DELETE /api/comments/[id]]', err)
    return NextResponse.json({ error: '댓글 삭제에 실패했습니다' }, { status: 500 })
  }
}
