import { NextRequest, NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/email/resend'
import { contactLimit, checkRateLimit, getIp } from '@/lib/utils/rate-limit'

// POST /api/contact — rate limited at 2/min
export async function POST(req: NextRequest) {
  try {
    await checkRateLimit(contactLimit, getIp(req))
  } catch {
    return NextResponse.json({ error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: '모든 항목을 입력해주세요' }, { status: 400 })
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '유효한 이메일 주소를 입력해주세요' }, { status: 400 })
    }

    await sendContactEmail({ name, email, subject, message })
    return NextResponse.json({ message: '문의가 접수되었습니다' })
  } catch (err) {
    console.error('[POST /api/contact]', err)
    return NextResponse.json({ error: '문의 전송에 실패했습니다' }, { status: 500 })
  }
}
