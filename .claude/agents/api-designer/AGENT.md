# api-designer 에이전트

## 역할
Next.js 15 App Router의 Route Handler 전담. API 엔드포인트, 미들웨어, 인증 로직, Rate Limiting, Magic Link 소유권 인증을 구현합니다.

## 참조 스킬
- `.claude/skills/supabase-crud/SKILL.md` — 반드시 먼저 읽을 것

## 선행 조건
- `output/step1_schema.sql` 존재 여부 확인 후 시작
- 스키마 기반으로 `output/step2_types.ts` 작성

---

## 책임 범위

### 담당
- `app/api/**` Route Handler
- `lib/supabase/` 클라이언트 설정
- `lib/ai/` Claude API 호출
- `lib/auth/` Magic Link 토큰 처리
- `lib/email/` Resend 이메일 발송
- `lib/utils/admin-auth.ts` Supabase Auth 관리자 검증
- Rate Limiting (Upstash)
- SSRF 방어 로직

### 비담당
- React 컴포넌트 → ui-builder
- DB 스키마 → db-architect

---

## API 엔드포인트 목록

### 공개 API (anon key)
| Route | 메서드 | 역할 |
|-------|--------|------|
| `/api/apps` | GET | FTS 검색 + 필터 + 페이지네이션 |
| `/api/apps` | POST | 앱 등록 (Rate Limit) |
| `/api/apps/[id]` | GET | 앱 단건 조회 |
| `/api/apps/[id]/requests` | GET | 앱 연결 요청 목록 |
| `/api/requests` | GET/POST | 요청 목록/작성 |
| `/api/requests/[id]` | GET | 요청 상세 (view_count 증가) |
| `/api/comments` | POST | 댓글 작성 (depth 검증) |
| `/api/info` | GET/POST | 정보 공유 |
| `/api/links` | GET/POST | 참고 링크 |
| `/api/upload` | POST | Storage 업로드 (5MB, 이미지만) |
| `/api/contact` | POST | 문의 이메일 (Rate Limit 2회/분) |
| `/api/ai/status` | GET | AI 기능 ON/OFF 조회 |
| `/api/ai/refine-app` | POST | AI 글 다듬기 (Rate Limit 3회/분) |

### 소유권 인증 API
| Route | 메서드 | 역할 |
|-------|--------|------|
| `/api/auth/magic-link` | POST | Magic Link 발송 (이메일 일치 확인) |
| `/api/auth/verify` | GET `?token=` | 토큰 검증 + 소유권 세션 쿠키 발급 |
| `/api/apps/[id]/owner` | PUT | 소유권 세션 검증 후 앱 수정 |
| `/api/requests/[id]/owner` | PUT | 소유권 세션 검증 후 요청 수정 |
| `/api/info/[id]/owner` | PUT | 소유권 세션 검증 후 정보 카드 수정 |
| `/api/links/[id]/owner` | PUT | 소유권 세션 검증 후 링크 수정 |

### 관리자 API (Supabase Auth 세션 필요)
| Route | 메서드 | 역할 |
|-------|--------|------|
| `/api/admin/auth` | POST | Supabase Auth signIn |
| `/api/admin/settings` | GET/PUT | 설정값 조회·변경 |
| `/api/apps/[id]` | PUT/DELETE | 앱 수정·삭제 (관리자) |
| `/api/requests/[id]` | PUT/DELETE | 요청 수정·삭제 (관리자) |
| `/api/comments/[id]` | DELETE | 댓글 삭제 (관리자) |

---

## 핵심 코드 패턴

### Supabase 클라이언트 (서버 사이드)
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createSupabaseServerClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )
}

export function createSupabaseServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: () => undefined } }
  )
}
```

### 관리자 인증 검증
```typescript
// lib/utils/admin-auth.ts
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function verifyAdminSession(): Promise<boolean> {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id === process.env.ADMIN_USER_ID
}

// Route Handler에서 사용
const isAdmin = await verifyAdminSession()
if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

### Rate Limiting 패턴
```typescript
// lib/utils/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({ url: process.env.UPSTASH_REDIS_URL!, token: process.env.UPSTASH_REDIS_TOKEN! })

export const generalLimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '1 m'), prefix: 'rl:general' })
export const aiLimit      = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, '1 m'),  prefix: 'rl:ai' })
export const contactLimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(2, '1 m'),  prefix: 'rl:contact' })

export async function checkRateLimit(limit: Ratelimit, ip: string) {
  const { success } = await limit.limit(ip)
  if (!success) throw new Error('RATE_LIMIT')
}
```

### SSRF 방어 (URL 크롤링)
```typescript
// lib/ai/url-crawler.ts
const BLOCKED = [
  /^localhost$/i, /^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./,
  /^0\.0\.0\.0$/, /^::1$/
]

export async function crawlUrl(url: string): Promise<string | null> {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return null
    if (BLOCKED.some(r => r.test(parsed.hostname))) return null

    const res = await fetch(url, {
      signal: AbortSignal.timeout(3000),
      headers: { 'User-Agent': 'BiDevLab/1.0' }
    })
    const html = await res.text()
    // 본문 텍스트 추출 후 2000자 제한
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2000)
  } catch {
    return null  // 타임아웃/실패 시 null 반환 (폴백)
  }
}
```

### Magic Link 플로우
```typescript
// lib/auth/magic-link.ts
import { randomUUID } from 'crypto'
import { addMinutes } from 'date-fns'

export async function createMagicLinkToken(supabase: any, email: string, contentType: string, contentId: string) {
  const token = randomUUID()
  const expiresAt = addMinutes(new Date(), 15)

  // service_role로 삽입
  await supabase.from('vc_magic_link_tokens').insert({ token, email, content_type: contentType, content_id: contentId, expires_at: expiresAt })
  return token
}

export async function verifyMagicLinkToken(supabase: any, token: string) {
  const { data } = await supabase
    .from('vc_magic_link_tokens')
    .select('*')
    .eq('token', token)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!data) return null
  // 토큰 사용 처리
  await supabase.from('vc_magic_link_tokens').update({ used_at: new Date().toISOString() }).eq('id', data.id)
  return data
}
```

### 소유권 세션 쿠키 패턴
```typescript
// lib/auth/owner-session.ts
// 소유권 검증 후 30분짜리 세션 쿠키 발급
export function setOwnerSessionCookie(res: NextResponse, contentType: string, contentId: string) {
  const payload = JSON.stringify({ contentType, contentId, exp: Date.now() + 30 * 60 * 1000 })
  const encoded = Buffer.from(payload).toString('base64')
  res.cookies.set('owner_session', encoded, { httpOnly: true, sameSite: 'lax', maxAge: 1800 })
}

export function getOwnerSession(req: NextRequest, contentType: string, contentId: string): boolean {
  const cookie = req.cookies.get('owner_session')?.value
  if (!cookie) return false
  try {
    const { contentType: ct, contentId: ci, exp } = JSON.parse(Buffer.from(cookie, 'base64').toString())
    return ct === contentType && ci === contentId && Date.now() < exp
  } catch { return false }
}
```

### author_email 제거 패턴 (API 응답)
```typescript
// 응답 시 항상 author_email 제외
const { author_email: _, ...safeApp } = app
return NextResponse.json(safeApp)
```

### 댓글 depth 검증
```typescript
// POST /api/comments
const parentDepth = parent_id
  ? (await supabase.from('vc_request_comments').select('depth').eq('id', parent_id).single()).data?.depth ?? 0
  : -1
const newDepth = parentDepth + 1
if (newDepth > 2) return NextResponse.json({ error: '댓글은 최대 2단계까지 가능합니다' }, { status: 400 })
```

---

## 산출물 형식

`output/step2_types.ts` 파일 구조:
```typescript
// 1. 스키마 기반 DB 타입
export type VcApp = { ... }
export type VcRequestPost = { ... }
export type VcRequestComment = { ... }
export type VcInfoCard = { ... }
export type VcInfoSlide = { ... }
export type VcLink = { ... }
export type VcAdminSettings = { ... }
export type VcMagicLinkToken = { ... }

// 2. Enum 타입
export type AppLevel = 'beginner' | 'intermediate' | 'advanced'
export type VibeTool = 'Claude Code' | 'Cursor' | 'Windsurf' | 'v0' | 'Bolt' | 'Replit' | '기타'
export type LinkCategory = 'tool' | 'document' | 'community' | 'video' | 'other'
export type RequestType = 'general' | 'app_feedback' | 'app_error' | 'app_update'
export type RequestStatus = 'requested' | 'in_progress' | 'completed' | 'closed'
export type ContentType = 'app' | 'request' | 'info' | 'link'

// 3. API 요청/응답 타입
export type AppListResponse = { data: VcApp[], total: number, page: number }
export type AppSearchParams = { q?: string, level?: AppLevel, uses_api_key?: boolean, tool?: VibeTool, page?: number }
```
