import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getRequest, updateRequest, softDeleteRequest } from '@/lib/supabase/queries/requests'
import { verifyAdminSession } from '@/lib/utils/admin-auth'

// GET /api/requests/[id] — public (view_count is incremented via separate POST /view endpoint)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServerClient()
    const post = await getRequest(supabase, id)
    if (!post) return NextResponse.json({ error: '요청을 찾을 수 없습니다' }, { status: 404 })
    return NextResponse.json({ data: post })
  } catch (err) {
    console.error('[GET /api/requests/[id]]', err)
    return NextResponse.json({ error: '요청을 불러올 수 없습니다' }, { status: 500 })
  }
}

// PUT /api/requests/[id] — admin only
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    await updateRequest(id, body)
    return NextResponse.json({ message: '수정되었습니다' })
  } catch (err) {
    console.error('[PUT /api/requests/[id]]', err)
    return NextResponse.json({ error: '요청 수정에 실패했습니다' }, { status: 500 })
  }
}

// DELETE /api/requests/[id] — admin only (soft delete)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    await softDeleteRequest(id)
    return NextResponse.json({ message: '삭제되었습니다' })
  } catch (err) {
    console.error('[DELETE /api/requests/[id]]', err)
    return NextResponse.json({ error: '요청 삭제에 실패했습니다' }, { status: 500 })
  }
}
