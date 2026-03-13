import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { verifyMagicLinkToken } from '@/lib/auth/magic-link'
import { setOwnerSessionCookie } from '@/lib/auth/owner-session'

// GET /api/auth/verify?token= — verifies magic link token + sets owner session cookie
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: '토큰이 없습니다' }, { status: 400 })
  }

  try {
    const serviceClient = createSupabaseServiceClient()
    const tokenData = await verifyMagicLinkToken(serviceClient, token)

    if (!tokenData) {
      return NextResponse.json({ error: '유효하지 않거나 만료된 토큰입니다' }, { status: 401 })
    }

    const res = NextResponse.json({
      message: '인증 성공',
      content_type: tokenData.content_type,
      content_id: tokenData.content_id,
    })

    setOwnerSessionCookie(res, tokenData.content_type, tokenData.content_id)
    return res
  } catch (err) {
    console.error('[GET /api/auth/verify]', err)
    return NextResponse.json({ error: '토큰 검증에 실패했습니다' }, { status: 500 })
  }
}
