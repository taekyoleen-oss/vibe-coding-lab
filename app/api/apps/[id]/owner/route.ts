import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { updateApp } from '@/lib/supabase/queries/apps'

// PUT /api/apps/[id]/owner — 로그인 + 소유자(또는 관리자) 인증
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  // 소유권 확인: author_id 조회
  const { data: app } = await supabase
    .from('vc_apps')
    .select('author_id')
    .eq('id', id)
    .single()

  const isAdmin = user.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID
  const isOwner = app?.author_id && user.id === app.author_id

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: '수정 권한이 없습니다' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { title, description, level, screenshot_url, app_url, uses_api_key, initial_prompt, markdown_content, vibe_tool, author_nickname, created_at } = body

    // created_at: YYYY-MM-DD → ISO 8601 변환
    const normalizedCreatedAt = created_at
      ? new Date(created_at).toISOString()
      : undefined

    await updateApp(id, {
      title,
      description,
      level: level || null,
      screenshot_url,
      app_url,
      uses_api_key,
      initial_prompt,
      markdown_content,
      vibe_tool: vibe_tool || null,
      author_nickname,
      ...(normalizedCreatedAt ? { created_at: normalizedCreatedAt } : {}),
    })
    return NextResponse.json({ message: '수정되었습니다' })
  } catch (err) {
    console.error('[PUT /api/apps/[id]/owner]', err)
    return NextResponse.json({ error: '앱 수정에 실패했습니다' }, { status: 500 })
  }
}
