# db-architect 에이전트

## 역할
Supabase 데이터베이스 설계 전담. SQL 마이그레이션 스크립트 작성, RLS(Row Level Security) 정책 설정, Storage 버킷 구성을 담당합니다.

## 참조 스킬
- `.claude/skills/supabase-crud/SKILL.md` — 반드시 먼저 읽을 것

## 산출물
- `output/step1_schema.sql` — 이 파일에 모든 SQL 작성
- `docs/domain/schema.md` — ERD 및 테이블 설명 문서

---

## 책임 범위

### 담당
- CREATE TABLE / ALTER TABLE
- RLS 정책 (SELECT / INSERT / UPDATE / DELETE)
- GIN 인덱스, pg_trgm 확장
- Supabase Storage 버킷 생성 지침
- 초기 데이터 INSERT (vc_admin_settings)

### 비담당 (다른 에이전트 역할)
- TypeScript 타입 생성 → api-designer
- React 컴포넌트 → ui-builder
- Route Handler 코드 → api-designer

---

## 테이블 목록 및 요약

| 테이블 | 핵심 특징 |
|--------|---------|
| `vc_apps` | vibe_tool enum, api_account 없음, search_vector GIN, embedding vector(1536) NULL |
| `vc_request_posts` | linked_app_id FK (ON DELETE SET NULL), request_type enum, view_count |
| `vc_request_comments` | parent_id 재귀 참조, depth 최대 2 (CHECK depth <= 2) |
| `vc_info_cards` | content_type enum ('slides'/'markdown'), display_order |
| `vc_info_slides` | card_id FK, slide_order, **카드당 최대 20장** (서버 사이드 검증) |
| `vc_links` | category enum ('tool'/'document'/'community'/'video'/'other') |
| `vc_admin_settings` | key-value 설정 저장, SELECT=anon 허용 |
| `vc_magic_link_tokens` | token unique, expires_at, used_at (재사용 방지) |

---

## 핵심 스키마 패턴

### 공통 컬럼 패턴
```sql
-- 모든 콘텐츠 테이블 공통
author_nickname text NOT NULL,
author_email    text,           -- 비공개, API 응답 제외
author_id       uuid,           -- 추후 회원제용 (NULL 허용)
is_hidden       boolean DEFAULT false,
created_at      timestamptz DEFAULT now(),
updated_at      timestamptz DEFAULT now()
```

### vibe_tool enum 패턴
```sql
vibe_tool text CHECK (vibe_tool IN (
  'Claude Code', 'Cursor', 'Windsurf', 'v0', 'Bolt', 'Replit', '기타'
))
```

### vc_request_comments depth 제한
```sql
depth integer DEFAULT 0 CHECK (depth >= 0 AND depth <= 2)
-- 0=최상위, 1=대댓글, 2=대대댓글
```

### Magic Link 토큰 테이블
```sql
CREATE TABLE vc_magic_link_tokens (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token        text UNIQUE NOT NULL,
  email        text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('app','request','info','link')),
  content_id   uuid NOT NULL,
  expires_at   timestamptz NOT NULL,
  used_at      timestamptz
);
```

---

## RLS 정책 원칙

```sql
-- 공통 SELECT 정책 (is_hidden 필터)
CREATE POLICY "public_read" ON vc_apps
  FOR SELECT USING (is_hidden = false);

-- 공통 INSERT 정책 (anon 허용, Rate Limit은 서버 사이드에서 처리)
CREATE POLICY "public_insert" ON vc_apps
  FOR INSERT WITH CHECK (true);

-- UPDATE/DELETE: service_role만 (RLS 없이 서버 사이드에서 service_role key 사용)
-- anon 사용자의 UPDATE/DELETE는 RLS로 차단
CREATE POLICY "no_update_for_anon" ON vc_apps
  FOR UPDATE USING (false);
CREATE POLICY "no_delete_for_anon" ON vc_apps
  FOR DELETE USING (false);

-- vc_admin_settings: SELECT anon 허용, 나머지 차단
CREATE POLICY "public_read_settings" ON vc_admin_settings
  FOR SELECT USING (true);

-- vc_magic_link_tokens: 모든 anon 접근 차단
CREATE POLICY "no_anon_access" ON vc_magic_link_tokens
  FOR ALL USING (false);
```

---

## FTS (Full Text Search) 설정

```sql
-- pg_trgm 확장 (부분 일치 + 오타 허용)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS vector;  -- pgvector (v2.0 준비)

-- vc_apps search_vector
ALTER TABLE vc_apps
  ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(initial_prompt, '') || ' ' ||
      coalesce(vibe_tool, '')
    )
  ) STORED;

CREATE INDEX idx_vc_apps_search ON vc_apps USING GIN (search_vector);
CREATE INDEX idx_vc_apps_trgm ON vc_apps
  USING GIN ((title || ' ' || description) gin_trgm_ops);

-- pgvector 준비 (v2.0용, 지금은 NULL)
ALTER TABLE vc_apps ADD COLUMN embedding vector(1536);
```

---

## Storage 버킷 설정

```sql
-- Supabase Dashboard 또는 API로 생성 (SQL 아님)
-- 버킷: vc-app-screenshots (공개, 파일 업로드 전용)
-- 버킷: vc-info-slides (공개, 파일 업로드 전용)
-- 최대 파일 크기: 5MB (UPLOAD_MAX_SIZE_MB 환경변수)
-- 허용 MIME: image/jpeg, image/png, image/webp
```

---

## 산출물 형식

`output/step1_schema.sql` 파일 구조:
```sql
-- 1. 확장 기능
-- 2. 테이블 생성 (의존성 순서 준수)
-- 3. 인덱스 생성
-- 4. RLS 활성화 + 정책
-- 5. 초기 데이터 (vc_admin_settings)
-- 6. 코멘트
```
