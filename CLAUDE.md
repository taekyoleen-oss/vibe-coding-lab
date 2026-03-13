# 비개발자의 개발실 — 메인 에이전트 지침

## 프로젝트 개요
비개발자가 바이브 코딩(Vibe Coding)으로 만든 앱을 공유하고 개발 경험을 나누는 비상업적 커뮤니티 플랫폼.

- **기술 스택**: Next.js 15 (App Router) · TweakCN (shadcn/ui 기반) · Supabase
- **배포**: Vercel
- **설계서**: `vibe-coding-share-design.md` (항상 최신 버전 참조)
- **현재 설계서 버전**: v1.7

---

## 에이전트 역할 분담

### 3개 서브에이전트 체계

| 에이전트 | 파일 | 역할 | 언제 호출하나 |
|---------|------|------|------------|
| `db-architect` | `.claude/agents/db-architect/AGENT.md` | DB 스키마, SQL 마이그레이션, RLS 정책, Storage 버킷 | 테이블 생성·변경, RLS 수정 |
| `api-designer` | `.claude/agents/api-designer/AGENT.md` | Route Handler, 미들웨어, 인증 로직, Rate Limit | API 엔드포인트 구현 |
| `ui-builder` | `.claude/agents/ui-builder/AGENT.md` | 페이지, 컴포넌트, 레이아웃, 다크모드, 애니메이션 | UI/컴포넌트 구현 |

### 에이전트 호출 순서 원칙
```
Phase 1: db-architect  →  output/step1_schema.sql
Phase 2: api-designer  →  output/step2_types.ts  (스키마 파일 참조)
Phase 3: ui-builder    →  components/, app/      (타입 파일 참조)
```
- **절대 순서를 바꾸지 말 것**: UI가 DB 스키마 없이 구현되면 타입 불일치 발생
- 각 에이전트는 이전 에이전트의 output 파일을 반드시 읽은 후 시작

---

## 스킬 목록

| 스킬 | 파일 | 트리거 조건 |
|------|------|-----------|
| `supabase-crud` | `.claude/skills/supabase-crud/SKILL.md` | Supabase 클라이언트/쿼리/RLS 작성 시 |
| `markdown-renderer` | `.claude/skills/markdown-renderer/SKILL.md` | react-markdown 컴포넌트 구현 시 |
| `tweakcn-components` | `.claude/skills/tweakcn-components/SKILL.md` | shadcn/ui 컴포넌트 커스터마이징 시 |

---

## 프로젝트 핵심 규칙

### 데이터 모델 제약
- **모든 테이블 prefix**: `vc_` (기존 Supabase 테이블과 충돌 방지)
- **소프트 삭제 원칙**: 하드 DELETE 대신 `is_hidden = true` 사용
- **author_email**: API 응답에서 반드시 제외 (개인정보)
- **vibe_tool**: 반드시 enum 값만 허용 (`'Claude Code' | 'Cursor' | 'Windsurf' | 'v0' | 'Bolt' | 'Replit' | '기타'`)
- **vc_links.category**: enum 값만 허용 (`'tool' | 'document' | 'community' | 'video' | 'other'`)

### 인증 규칙
- **관리자 인증**: Supabase Auth (email/password) — 환경변수 기반 JWT 절대 사용 금지
- **일반 사용자 쓰기**: `anon` key INSERT만
- **수정·삭제**: `service_role` key만 (서버 사이드 전용)
- **소유권 인증**: Magic Link 토큰 (15분 유효, `vc_magic_link_tokens` 테이블)

### 보안 규칙
- `initial_prompt` 필드: 전체 공개 — 등록 폼에 경고 문구 필수
- URL 크롤링: SSRF 방어 필수 (private IP 차단, https만 허용)
- `SUPABASE_SERVICE_ROLE_KEY`: 서버 사이드 전용, 클라이언트 코드에 절대 노출 금지

### UI/UX 규칙
- **다크모드**: `next-themes` 사용, TweakCN 토큰 기반 (v1.0 포함)
- **모바일 네비게이션**: 햄버거 메뉴 (하단 탭 아님)
- **앱 목록**: 페이지네이션 12개/페이지 (무한 스크롤 아님)
- **앱 상세**: 페이지 이동 `/apps/[id]` (모달 아님) + OG 메타태그 포함
- **댓글**: 최대 depth 2 (0=최상위, 1=대댓글, 2=대대댓글)

---

## 산출물 파일 규약

```
output/
  step1_schema.sql    ← db-architect가 작성
  step2_types.ts      ← api-designer가 작성 (스키마 기반)
  seed.sql            ← 시드 데이터 (각 섹션 3~5개 예시 콘텐츠)
```

---

## 환경 변수 목록

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_USER_ID             ← Supabase Auth 관리자 UID
ANTHROPIC_API_KEY
RESEND_API_KEY
CONTACT_EMAIL             ← taekyoleen@gmail.com
CONTACT_FROM              ← noreply@yourdomain.com
UPLOAD_MAX_SIZE_MB        ← 기본값: 5
RATE_LIMIT_PER_MINUTE     ← 기본값: 10
AI_RATE_LIMIT_PER_MINUTE  ← 기본값: 3
UPSTASH_REDIS_URL
UPSTASH_REDIS_TOKEN
```

**절대 사용 금지**: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`

---

## 구현 순서 (Phase)

```
Phase 1 — DB & 인프라     (db-architect)
Phase 2 — API 전체        (api-designer)
Phase 3 — UI 기반         (ui-builder)
Phase 4 — 섹션별 페이지   (ui-builder)
Phase 5 — 관리자 대시보드  (ui-builder + api-designer)
Phase 6 — 마무리          (시드 데이터 + 배포)
```

자세한 구현 순서는 `vibe-coding-share-design.md` §13 참조.
