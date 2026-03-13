import type { Metadata } from 'next'
import { AppSubmitForm } from '@/components/apps/AppSubmitForm'

export const metadata: Metadata = {
  title: '앱 등록하기 — 비개발자의 개발실',
  description: 'AI로 만든 앱을 등록하고 공유하세요.',
}

export default function NewAppPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">앱 등록하기</h1>
      <p className="text-sm text-muted-foreground mb-8">
        AI 도구로 만든 앱을 등록하고 다른 비개발자들과 경험을 나눠보세요.
      </p>
      <AppSubmitForm />
    </div>
  )
}
