import { Resend } from 'resend'
import type { ContentType } from '@/output/step2_types'

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set')
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS ?? 'noreply@vibecodelabs.kr'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://vibecodelabs.kr'

/**
 * Sends a magic link email to the content owner.
 */
export async function sendMagicLinkEmail({
  to,
  token,
  contentType,
  contentId,
}: {
  to: string
  token: string
  contentType: ContentType
  contentId: string
}): Promise<void> {
  const verifyUrl = `${BASE_URL}/api/auth/verify?token=${token}`

  const contentLabel: Record<ContentType, string> = {
    app: '앱',
    request: '개발요청',
    info: '정보 카드',
    link: '참고 링크',
  }

  const { error } = await getResend().emails.send({
    from: FROM_ADDRESS,
    to,
    subject: '[비개발자의 개발실] 소유권 인증 링크',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>소유권 인증</h2>
        <p>등록하신 ${contentLabel[contentType]} (ID: ${contentId})의 수정 권한을 인증합니다.</p>
        <p>아래 버튼을 클릭하여 인증을 완료하세요. 링크는 <strong>15분</strong> 후 만료됩니다.</p>
        <a
          href="${verifyUrl}"
          style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;"
        >
          인증하기
        </a>
        <p style="color:#666;font-size:12px;">
          이 이메일을 요청하지 않으셨다면 무시하셔도 됩니다.
        </p>
      </div>
    `,
  })

  if (error) {
    console.error('[Resend] Magic link email error:', error)
    throw new Error('Failed to send magic link email')
  }
}

/**
 * Sends a contact form inquiry email to the admin.
 */
export async function sendContactEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string
  email: string
  subject: string
  message: string
}): Promise<void> {
  const { error } = await getResend().emails.send({
    from: FROM_ADDRESS,
    to: ADMIN_EMAIL,
    replyTo: email,
    subject: `[문의] ${subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>새 문의가 접수되었습니다</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;width:100px;"><strong>이름</strong></td>
            <td style="padding:8px;border:1px solid #ddd;">${name}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><strong>이메일</strong></td>
            <td style="padding:8px;border:1px solid #ddd;">${email}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;"><strong>제목</strong></td>
            <td style="padding:8px;border:1px solid #ddd;">${subject}</td>
          </tr>
        </table>
        <div style="margin-top:16px;padding:16px;border:1px solid #ddd;border-radius:4px;white-space:pre-wrap;">
          ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </div>
      </div>
    `,
  })

  if (error) {
    console.error('[Resend] Contact email error:', error)
    throw new Error('Failed to send contact email')
  }
}
