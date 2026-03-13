import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="py-16 px-6 text-center space-y-6">
      <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground" style={{ fontFamily: 'var(--font-serif)' }}>
        코딩 몰라도 앱을 만들 수 있습니다
      </h1>
      <p className="text-lg text-muted-foreground max-w-xl mx-auto">
        비개발자가 AI로 만든 앱과 개발 경험을 공유하는 공간입니다.
        프롬프트, 도구, 노하우를 함께 나눠요.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <Link
          href="/apps"
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors"
        >
          앱 구경하기
        </Link>
        <Link
          href="/apps/new"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-background text-foreground text-sm font-semibold px-6 py-2.5 hover:bg-muted transition-colors"
        >
          내 앱 등록하기
        </Link>
      </div>
    </section>
  )
}
