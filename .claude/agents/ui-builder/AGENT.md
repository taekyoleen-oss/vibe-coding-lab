# ui-builder 에이전트

## 역할
Next.js 15 App Router 기반 페이지·컴포넌트 구현 전담. TweakCN(shadcn/ui) 커스터마이징, 다크모드, 반응형 레이아웃, 애니메이션을 담당합니다.

## 참조 스킬
- `.claude/skills/tweakcn-components/SKILL.md` — UI 컴포넌트 커스터마이징 시 반드시 참조
- `.claude/skills/markdown-renderer/SKILL.md` — MarkdownViewer/MarkdownEditor 구현 시 참조

## 선행 조건
- `output/step2_types.ts` 존재 여부 확인 후 시작
- 타입 임포트는 항상 이 파일에서

---

## 책임 범위

### 담당
- `app/` 모든 페이지 컴포넌트
- `components/` 모든 React 컴포넌트
- `globals.css` / Tailwind 설정
- 다크모드 (`next-themes`)
- 반응형 레이아웃
- 애니메이션 (`framer-motion`)

### 비담당
- API 로직 → api-designer
- DB 스키마 → db-architect

---

## 컴포넌트 목록

### 레이아웃
| 컴포넌트 | 파일 | 역할 |
|---------|------|------|
| `AnnouncementBanner` | `components/layout/AnnouncementBanner.tsx` | 상단 공지 배너 + 닫기 (세션 기억) |
| `AppSidebar` | `components/layout/AppSidebar.tsx` | 좌측 사이드바 (데스크탑) |
| `MobileNavOverlay` | `components/layout/MobileNavOverlay.tsx` | 햄버거 메뉴 + 오버레이 사이드바 |
| `DarkModeToggle` | `components/layout/DarkModeToggle.tsx` | 헤더 다크/라이트 토글 |

### 홈
| 컴포넌트 | 파일 | 역할 |
|---------|------|------|
| `HeroSection` | `components/home/HeroSection.tsx` | 슬로건 + 사이트 목적 + CTA 버튼 |

### 공통
| 컴포넌트 | 파일 | 역할 |
|---------|------|------|
| `NicknameInput` | `components/common/NicknameInput.tsx` | 공통 닉네임 입력 |
| `MarkdownViewer` | `components/common/MarkdownViewer.tsx` | react-markdown 렌더러 |
| `MarkdownEditor` | `components/common/MarkdownEditor.tsx` | 마크다운 에디터 + 미리보기 |
| `Pagination` | `components/common/Pagination.tsx` | URL `?page=N` 기반 페이지 네비게이터 |
| `EditOwnerGate` | `components/ownership/EditOwnerGate.tsx` | 이메일 입력 + Magic Link 발송 |
| `OwnerEditForm` | `components/ownership/OwnerEditForm.tsx` | 소유권 인증 후 수정 폼 래퍼 |

### 개발앱
| 컴포넌트 | 파일 | 역할 |
|---------|------|------|
| `AppCard` | `components/apps/AppCard.tsx` | 카드 썸네일, 이름, 레벨 뱃지 |
| `AppGrid` | `components/apps/AppGrid.tsx` | 카드 그리드 + 페이지네이션 |
| `AppSubmitForm` | `components/apps/AppSubmitForm.tsx` | 앱 등록 폼 (AI 버튼 포함) |
| `AiRefineButton` | `components/apps/AiRefineButton.tsx` | "✨ AI가 수정하기" + 로딩 |
| `AiRefinePreview` | `components/apps/AiRefinePreview.tsx` | AI 결과 미리보기 + 적용/취소 |
| `LevelBadge` | `components/apps/LevelBadge.tsx` | 초급/중급/고급 뱃지 |
| `AppSearchBar` | `components/apps/AppSearchBar.tsx` | 텍스트 검색창 |
| `AppFilterChips` | `components/apps/AppFilterChips.tsx` | API KEY·툴 필터 칩 |
| `SearchHighlight` | `components/apps/SearchHighlight.tsx` | 검색어 강조 |
| `AppRequestButton` | `components/apps/AppRequestButton.tsx` | "이 앱에 요청하기" 버튼 |
| `AppRequestForm` | `components/apps/AppRequestForm.tsx` | 앱 상세 인라인 요청 폼 |
| `AppRequestList` | `components/apps/AppRequestList.tsx` | 앱 연결 요청 목록 |

### 개발요청
| 컴포넌트 | 파일 | 역할 |
|---------|------|------|
| `RequestPostCard` | `components/requests/RequestPostCard.tsx` | 요청 카드 (LinkedAppMiniCard 포함) |
| `RequestSubmitForm` | `components/requests/RequestSubmitForm.tsx` | 요청 작성 폼 |
| `CommentThread` | `components/requests/CommentThread.tsx` | 중첩 댓글 (depth ≤ 2) |
| `CommentForm` | `components/requests/CommentForm.tsx` | 댓글/답글 입력 |
| `StatusBadge` | `components/requests/StatusBadge.tsx` | 요청 상태 뱃지 |
| `RequestTypeBadge` | `components/requests/RequestTypeBadge.tsx` | 요청 유형 뱃지 |
| `LinkedAppMiniCard` | `components/requests/LinkedAppMiniCard.tsx` | 연결된 앱 미니카드 |

### 정보 공유 / 링크 / 관리자
| 컴포넌트 | 파일 | 역할 |
|---------|------|------|
| `InfoCard` | `components/info/InfoCard.tsx` | 정보 공유 카드 |
| `InfoSubmitForm` | `components/info/InfoSubmitForm.tsx` | 정보 공유 작성 폼 |
| `SlideViewer` | `components/info/SlideViewer.tsx` | 슬라이드 뷰어 (최대 20장) |
| `LinkCard` | `components/links/LinkCard.tsx` | 참고 링크 카드 |
| `LinkSubmitForm` | `components/links/LinkSubmitForm.tsx` | 링크 추가 폼 |
| `ContactForm` | `components/contact/ContactForm.tsx` | 문의 폼 |
| `AdminLoginForm` | `components/admin/AdminLoginForm.tsx` | Supabase Auth 로그인 폼 |
| `AdminDashboard` | `components/admin/AdminDashboard.tsx` | 관리자 탭 래퍼 (5탭) |
| `AdminSettingsTab` | `components/admin/AdminSettingsTab.tsx` | 설정 탭 |
| `ApiFeatureToggle` | `components/admin/ApiFeatureToggle.tsx` | API ON/OFF 토글 카드 |

---

## 핵심 구현 패턴

### 다크모드 설정 (next-themes)
```tsx
// app/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 모바일 햄버거 메뉴 패턴
```tsx
// sm 브레이크포인트에서 사이드바 숨기고 햄버거 표시
<div className="flex">
  {/* 사이드바: 모바일에서 숨김 */}
  <aside className="hidden md:flex w-64 ...">
    <AppSidebar />
  </aside>
  {/* 햄버거: 모바일에서만 표시 */}
  <button className="md:hidden ..." onClick={() => setOpen(true)}>
    <Menu className="h-5 w-5" />
  </button>
  {/* 오버레이 */}
  {open && <MobileNavOverlay onClose={() => setOpen(false)} />}
</div>
```

### 페이지네이션 패턴
```tsx
// URL 파라미터 기반
const searchParams = useSearchParams()
const page = Number(searchParams.get('page')) || 1
const PAGE_SIZE = 12

// Pagination 컴포넌트
<Pagination currentPage={page} totalItems={total} pageSize={PAGE_SIZE} />
```

### OG 메타태그 (앱 상세)
```tsx
// app/apps/[id]/page.tsx
export async function generateMetadata({ params }: { params: { id: string } }) {
  const app = await getApp(params.id)
  return {
    title: `${app.title} — 비개발자의 개발실`,
    description: app.description,
    openGraph: {
      title: app.title,
      description: app.description,
      images: app.screenshot_url ? [{ url: app.screenshot_url }] : [],
    },
  }
}
```

### 카드 hover 애니메이션 (framer-motion)
```tsx
<motion.div
  whileHover={{ y: -2 }}
  transition={{ duration: 0.15, ease: 'easeOut' }}
  className="shadow-sm hover:shadow-md"
>
  {/* 카드 내용 */}
</motion.div>
```

### AI 글 다듬기 버튼 비활성화 (OFF 상태)
```tsx
// /api/ai/status 조회 결과 반영
const { data: aiStatus } = useSWR('/api/ai/status')
<Button
  disabled={!aiStatus?.enabled}
  title={!aiStatus?.enabled ? '현재 관리자에 의해 비활성화됨' : undefined}
>
  ✨ AI가 수정하기
</Button>
```

### initial_prompt 경고 문구
```tsx
<div className="space-y-1.5">
  <Label>초기 개발 프롬프트</Label>
  <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950 p-2.5 text-sm text-amber-800 dark:text-amber-200">
    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
    <span>⚠️ 개인정보, API 키, 비밀번호 등 민감한 정보는 입력하지 마세요. 이 내용은 모든 방문자에게 공개됩니다.</span>
  </div>
  <Textarea ... />
</div>
```

### EditOwnerGate 사용 패턴
```tsx
// 앱 상세 등 콘텐츠 페이지
{app.author_email ? (
  <EditOwnerGate contentType="app" contentId={app.id}>
    {(isAuthenticated) =>
      isAuthenticated ? (
        <OwnerEditForm contentType="app" content={app} />
      ) : null
    }
  </EditOwnerGate>
) : (
  <p className="text-sm text-muted-foreground">
    이메일을 입력하지 않아 수정할 수 없습니다. 수정이 필요하면 관리자에게 문의해 주세요.
  </p>
)}
```

---

## 컬러 토큰 (TweakCN)

| 토큰 | 용도 |
|------|------|
| `--primary` | 주 액션 버튼, 활성 메뉴 (녹색 계열) |
| `--secondary` | 보조 버튼, 뱃지 (보라-파랑) |
| `--accent` | 하이라이트, 호버 (청록) |
| `--background` | 전체 배경 |
| `--card` | 카드 배경 |
| `--muted` | 비활성 텍스트 |

레벨 뱃지 컬러:
- 초급: `bg-green-100 text-green-800`
- 중급: `bg-blue-100 text-blue-800`
- 고급: `bg-purple-100 text-purple-800`

---

## 폰트
- 본문: Plus Jakarta Sans
- 제목: Source Serif 4
- 코드/프롬프트: JetBrains Mono

---

## 반응형 브레이크포인트

| 브레이크포인트 | 레이아웃 |
|--------------|---------|
| `sm` (640px) | 햄버거 메뉴, 단일 컬럼 |
| `md` (768px) | 사이드바 아이콘만 |
| `lg` (1024px) | 사이드바 전체 |
| `xl` (1280px) | 카드 그리드 3열 |
