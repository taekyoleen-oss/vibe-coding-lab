import type { Metadata } from 'next'
import { LinkSubmitForm } from '@/components/links/LinkSubmitForm'

export const metadata: Metadata = {
  title: '링크 추가 — 비개발자의 개발실',
  description: '바이브 코딩에 유용한 링크를 추가해 주세요.',
}

export default function NewLinkPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">참고 링크 추가</h1>
      <p className="text-sm text-muted-foreground mb-8">
        바이브 코딩에 유용한 도구, 문서, 커뮤니티 링크를 추가해 주세요.
      </p>
      <LinkSubmitForm />
    </div>
  )
}
