# tweakcn-components 스킬

## 용도
TweakCN(shadcn/ui 기반) 컴포넌트 커스터마이징 패턴 및 globals.css 토큰 적용 가이드

---

## 컬러 토큰 (globals.css 기반)

```css
/* 라이트 모드 */
:root {
  --primary: oklch(0.6487 0.1538 150.3071);       /* 녹색 계열 — 주 액션 버튼 */
  --secondary: oklch(0.6746 0.1414 261.3380);     /* 보라-파랑 — 보조 버튼, 뱃지 */
  --accent: oklch(0.8269 0.1080 211.9627);        /* 청록 — 하이라이트, 호버 */
  --background: oklch(0.9824 0.0013 286.3757);   /* 밝은 회백 */
  --card: oklch(1.0000 0 0);                      /* 흰색 */
  --muted: oklch(0.8828 0.0285 98.1033);         /* 비활성 텍스트 */
}
/* 다크 모드 변수는 .dark 클래스에 정의 (next-themes) */
```

---

## 컴포넌트별 커스터마이징 방향

### Button
```tsx
// 기본 primary 버튼
<Button className="font-semibold rounded-[0.5rem]">등록하기</Button>

// 비활성 상태 (AI 기능 OFF)
<Button disabled className="cursor-not-allowed opacity-50">✨ AI가 수정하기</Button>
```

### Card (앱 카드)
```tsx
<Card className="bg-card shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer">
  <CardContent className="p-4">
    {/* 내용 */}
  </CardContent>
</Card>
```

### Badge (레벨 뱃지)
```tsx
// LevelBadge 컴포넌트
const LEVEL_STYLES = {
  beginner:     'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  advanced:     'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}
const LEVEL_LABELS = { beginner: '초급', intermediate: '중급', advanced: '고급' }

export function LevelBadge({ level }: { level: AppLevel }) {
  return (
    <Badge className={LEVEL_STYLES[level]}>{LEVEL_LABELS[level]}</Badge>
  )
}
```

### Badge (요청 상태)
```tsx
const STATUS_STYLES = {
  requested:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed:   'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  closed:      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}
const STATUS_LABELS = {
  requested: '요청됨', in_progress: '진행중', completed: '완료', closed: '닫힘'
}
```

### Sidebar (활성 메뉴 강조)
```tsx
<nav>
  {NAV_ITEMS.map(item => (
    <Link
      key={item.href}
      href={item.href}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
        isActive(item.href)
          ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
      )}
    >
      {item.icon}
      {item.label}
    </Link>
  ))}
</nav>
```

### Alert (공지 배너)
```tsx
<Alert className="rounded-none border-x-0 border-t-0 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800">
  <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
    이 공간은 비개발자가 앱을 개발하는 데 도움을 주고...
  </AlertDescription>
</Alert>
```

### Tabs (앱 상세 페이지)
```tsx
<Tabs defaultValue="info">
  <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
    <TabsTrigger value="info" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
      기본정보
    </TabsTrigger>
    <TabsTrigger value="prompt">프롬프트</TabsTrigger>
    <TabsTrigger value="markdown">마크다운 설명</TabsTrigger>
    <TabsTrigger value="requests">이 앱의 요청 {count}건</TabsTrigger>
  </TabsList>
  <TabsContent value="prompt">
    <pre className="font-mono text-sm bg-muted p-4 rounded-md overflow-auto">{app.initial_prompt}</pre>
  </TabsContent>
</Tabs>
```

### Dialog/Sheet (필요 시)
```tsx
// 확인 삭제 다이얼로그
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>정말 삭제하시겠습니까?</DialogTitle>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>취소</Button>
      <Button variant="destructive" onClick={handleDelete}>삭제</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Carousel (슬라이드 뷰어)
```tsx
import useEmblaCarousel from 'embla-carousel-react'

export function SlideViewer({ slides }: { slides: VcInfoSlide[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel()

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, i) => (
            <div key={slide.id} className="relative flex-[0_0_100%]">
              <img src={slide.slide_url} alt={slide.alt_text ?? `슬라이드 ${i + 1}`} className="w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
      {/* 페이지 인디케이터 */}
      <div className="flex justify-center gap-1.5 mt-3">
        {slides.map((_, i) => (
          <button key={i} onClick={() => emblaApi?.scrollTo(i)}
            className={cn('h-1.5 rounded-full transition-all', i === current ? 'w-4 bg-primary' : 'w-1.5 bg-muted')}
          />
        ))}
      </div>
    </div>
  )
}
```

---

## 히어로 섹션 (홈)

```tsx
// components/home/HeroSection.tsx
export function HeroSection() {
  return (
    <section className="py-16 px-6 text-center space-y-6">
      <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">
        코딩 몰라도 앱을 만들 수 있습니다
      </h1>
      <p className="text-lg text-muted-foreground max-w-xl mx-auto">
        비개발자가 AI로 만든 앱과 개발 경험을 공유하는 공간입니다.
        프롬프트, 도구, 노하우를 함께 나눠요.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <Button asChild size="lg">
          <Link href="/apps/beginner">앱 구경하기</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/apps/new">내 앱 등록하기</Link>
        </Button>
      </div>
    </section>
  )
}
```

---

## 폰트 설정 (Next.js)

```typescript
// app/layout.tsx
import { Plus_Jakarta_Sans, Source_Serif_4 } from 'next/font/google'
import localFont from 'next/font/local'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans' })
const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-serif' })
// JetBrains Mono는 로컬 또는 Google Fonts에서 로드
```

---

## cn 유틸리티

```typescript
// lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
