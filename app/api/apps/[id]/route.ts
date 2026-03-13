import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getApp, updateApp, softDeleteApp } from '@/lib/supabase/queries/apps'
import { verifyAdminSession } from '@/lib/utils/admin-auth'

// GET /api/apps/[id] — public
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServerClient()
    const app = await getApp(supabase, id)
    if (!app) return NextResponse.json({ error: '앱을 찾을 수 없습니다' }, { status: 404 })
    return NextResponse.json({ data: app })
  } catch (err) {
    console.error('[GET /api/apps/[id]]', err)
    return NextResponse.json({ error: '앱을 불러올 수 없습니다' }, { status: 500 })
  }
}

// PUT /api/apps/[id] — admin only
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    await updateApp(id, body)
    return NextResponse.json({ message: '수정되었습니다' })
  } catch (err) {
    console.error('[PUT /api/apps/[id]]', err)
    return NextResponse.json({ error: '앱 수정에 실패했습니다' }, { status: 500 })
  }
}

// DELETE /api/apps/[id] — admin only (soft delete)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    await softDeleteApp(id)
    return NextResponse.json({ message: '삭제되었습니다' })
  } catch (err) {
    console.error('[DELETE /api/apps/[id]]', err)
    return NextResponse.json({ error: '앱 삭제에 실패했습니다' }, { status: 500 })
  }
}
