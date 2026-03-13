import { Suspense } from 'react'
import type { Metadata } from 'next'
import { VerifyTokenClient } from './VerifyTokenClient'

export const metadata: Metadata = {
  title: '소유권 인증 — 비개발자의 개발실',
}

interface PageProps {
  searchParams: Promise<{ token?: string; type?: string; id?: string }>
}

export default async function EditVerifyPage({ searchParams }: PageProps) {
  const sp = await searchParams

  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center">
      <Suspense fallback={
        <div className="space-y-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">인증 확인 중...</p>
        </div>
      }>
        <VerifyTokenClient token={sp.token} type={sp.type} id={sp.id} />
      </Suspense>
    </div>
  )
}
