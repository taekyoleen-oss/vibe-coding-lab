import type { Metadata } from 'next'
import Link from 'next/link'
import { ContactForm } from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: '관리자에게 문의 — 비개발자의 개발실',
  description: '운영, 신고, 앱 관련 문의를 남겨주세요.',
}

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">관리자에게 문의하기</h1>
        <p className="text-sm text-muted-foreground">
          운영, 신고, 계정 관련 문의입니다.
          개발 요청은{' '}
          <Link href="/requests" className="text-primary underline underline-offset-2">
            개발요청 게시판
          </Link>
          을 이용해 주세요.
        </p>
      </div>

      <ContactForm />
    </div>
  )
}
