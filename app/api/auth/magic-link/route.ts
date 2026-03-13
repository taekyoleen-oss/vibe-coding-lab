import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { createMagicLinkToken } from '@/lib/auth/magic-link'
import { sendMagicLinkEmail } from '@/lib/email/resend'
import { generalLimit, checkRateLimit, getIp } from '@/lib/utils/rate-limit'
import type { ContentType } from '@/output/step2_types'

const CONTENT_TABLES: Record<ContentType, string> = {
  app: 'vc_apps',
  request: 'vc_request_posts',
  info: 'vc_info_cards',
  link: 'vc_links',
}

// POST /api/auth/magic-link — sends a magic link if email matches the content's author_email
export async function POST(req: NextRequest) {
  try {
    await checkRateLimit(generalLimit, getIp(req))
  } catch {
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { email, content_type, content_id } = body as {
      email: string
      content_type: ContentType
      content_id: string
    }

    if (!email || !content_type || !content_id) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요' }, { status: 400 })
    }

    const table = CONTENT_TABLES[content_type]
    if (!table) {
      return NextResponse.json({ error: '유효하지 않은 콘텐츠 타입입니다' }, { status: 400 })
    }

    // Use service_role to access author_email (not exposed via anon)
    const serviceClient = createSupabaseServiceClient()
    const { data: content, error } = await serviceClient
      .from(table)
      .select('author_email')
      .eq('id', content_id)
      .single()

    if (error || !content) {
      return NextResponse.json({ error: '콘텐츠를 찾을 수 없습니다' }, { status: 404 })
    }

    // Always return 200 to prevent email enumeration
    if (!content.author_email || content.author_email !== email) {
      return NextResponse.json({ message: '인증 링크가 발송되었습니다 (이메일이 등록된 경우)' })
    }

    const token = await createMagicLinkToken(serviceClient, email, content_type, content_id)
    await sendMagicLinkEmail({ to: email, token, contentType: content_type, contentId: content_id })

    return NextResponse.json({ message: '인증 링크가 발송되었습니다 (이메일이 등록된 경우)' })
  } catch (err) {
    console.error('[POST /api/auth/magic-link]', err)
    return NextResponse.json({ error: '인증 링크 발송에 실패했습니다' }, { status: 500 })
  }
}
