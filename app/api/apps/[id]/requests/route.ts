import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getRequests } from '@/lib/supabase/queries/requests'

// GET /api/apps/[id]/requests — public, returns requests linked to a specific app
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = req.nextUrl
    const page = Number(searchParams.get('page') ?? '1')

    const supabase = await createSupabaseServerClient()
    const result = await getRequests(supabase, { linked_app_id: id, page })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[GET /api/apps/[id]/requests]', err)
    return NextResponse.json({ error: '요청 목록을 불러올 수 없습니다' }, { status: 500 })
  }
}
