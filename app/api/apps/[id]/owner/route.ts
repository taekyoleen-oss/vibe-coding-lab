import { NextRequest, NextResponse } from 'next/server'
import { getOwnerSession } from '@/lib/auth/owner-session'
import { updateApp } from '@/lib/supabase/queries/apps'

// PUT /api/apps/[id]/owner — owner session auth
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const isOwner = getOwnerSession(req, 'app', id)
  if (!isOwner) {
    return NextResponse.json({ error: '소유권 인증이 필요합니다' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Owner can only update limited fields — not is_hidden or admin-only fields
    const { title, description, level, screenshot_url, app_url, uses_api_key, initial_prompt, markdown_content, vibe_tool, author_nickname } = body
    await updateApp(id, {
      title,
      description,
      level,
      screenshot_url,
      app_url,
      uses_api_key,
      initial_prompt,
      markdown_content,
      vibe_tool,
      author_nickname,
    })
    return NextResponse.json({ message: '수정되었습니다' })
  } catch (err) {
    console.error('[PUT /api/apps/[id]/owner]', err)
    return NextResponse.json({ error: '앱 수정에 실패했습니다' }, { status: 500 })
  }
}
