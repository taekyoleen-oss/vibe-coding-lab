import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// POST /api/admin/auth — Supabase Auth signIn (email + password)
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: '이메일과 비밀번호를 입력해주세요' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return NextResponse.json({ error: '로그인에 실패했습니다' }, { status: 401 })
    }

    // Verify the logged-in user is the admin
    if (data.user.id !== process.env.NEXT_PUBLIC_ADMIN_USER_ID) {
      await supabase.auth.signOut()
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    return NextResponse.json({ message: '로그인 성공' })
  } catch (err) {
    console.error('[POST /api/admin/auth]', err)
    return NextResponse.json({ error: '로그인 처리 중 오류가 발생했습니다' }, { status: 500 })
  }
}
