import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { RequestSubmitForm } from '@/components/requests/RequestSubmitForm'

export const metadata: Metadata = {
  title: '개발요청 작성 — 비개발자의 개발실',
  description: '앱 개발 요청, 피드백, 오류 신고 등을 남겨주세요.',
}

export default async function NewRequestPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/requests/new')
  }

  const nickname = user.user_metadata?.nickname ?? user.email?.split('@')[0] ?? ''

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">개발요청 작성</h1>
      <p className="text-sm text-muted-foreground mb-8">
        앱 개발 요청, 피드백, 오류 신고 등을 자유롭게 남겨주세요.
      </p>
      <RequestSubmitForm defaultNickname={nickname} />
    </div>
  )
}
