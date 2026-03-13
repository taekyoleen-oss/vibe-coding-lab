import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getInfoCard, softDeleteInfoCard } from '@/lib/supabase/queries/info'
import { verifyAdminSession } from '@/lib/utils/admin-auth'

// GET /api/info/[id] — public
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServerClient()
    const card = await getInfoCard(supabase, id)
    if (!card) return NextResponse.json({ error: '정보 카드를 찾을 수 없습니다' }, { status: 404 })
    return NextResponse.json({ data: card })
  } catch (err) {
    console.error('[GET /api/info/[id]]', err)
    return NextResponse.json({ error: '정보 카드를 불러올 수 없습니다' }, { status: 500 })
  }
}

// DELETE /api/info/[id] — admin only (soft delete)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    await softDeleteInfoCard(id)
    return NextResponse.json({ message: '삭제되었습니다' })
  } catch (err) {
    console.error('[DELETE /api/info/[id]]', err)
    return NextResponse.json({ error: '정보 카드 삭제에 실패했습니다' }, { status: 500 })
  }
}
