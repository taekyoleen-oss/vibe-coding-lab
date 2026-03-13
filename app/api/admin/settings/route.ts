import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getAllSettings, updateSetting } from '@/lib/supabase/queries/settings'
import { verifyAdminSession } from '@/lib/utils/admin-auth'

// GET /api/admin/settings — admin only
export async function GET() {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const supabase = await createSupabaseServerClient()
    const settings = await getAllSettings(supabase)
    return NextResponse.json({ data: settings })
  } catch (err) {
    console.error('[GET /api/admin/settings]', err)
    return NextResponse.json({ error: '설정을 불러올 수 없습니다' }, { status: 500 })
  }
}

// PUT /api/admin/settings — admin only
export async function PUT(req: NextRequest) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { key, value } = body

    if (!key || value === undefined || value === null) {
      return NextResponse.json({ error: 'key와 value를 입력해주세요' }, { status: 400 })
    }

    await updateSetting(String(key), String(value))
    return NextResponse.json({ message: '설정이 업데이트되었습니다' })
  } catch (err) {
    console.error('[PUT /api/admin/settings]', err)
    return NextResponse.json({ error: '설정 업데이트에 실패했습니다' }, { status: 500 })
  }
}
