import type { Metadata } from 'next'
import { InfoSubmitForm } from '@/components/info/InfoSubmitForm'

export const metadata: Metadata = {
  title: '정보 공유 작성 — 비개발자의 개발실',
  description: '바이브 코딩 팁, 가이드, 노하우를 공유해 주세요.',
}

export default function NewInfoPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">정보 공유 작성</h1>
      <p className="text-sm text-muted-foreground mb-8">
        바이브 코딩 팁, 가이드, 노하우를 공유해 주세요. 마크다운 문서 또는 슬라이드 이미지로 작성할 수 있습니다.
      </p>
      <InfoSubmitForm />
    </div>
  )
}
