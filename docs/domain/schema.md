# 비개발자의 개발실 — DB 스키마 다이어그램

> 자동 생성 대상: `output/step1_schema.sql` 완성 후 Supabase CLI로 타입 생성
> 마지막 수정: v1.7

---

## ERD (테이블 관계)

```
vc_apps ──────────────────────────────────────────┐
  id (PK)                                         │
  title, description, level                       │
  screenshot_url, app_url                         │
  uses_api_key, vibe_tool (enum)                  │
  initial_prompt, markdown_content                │
  author_nickname, author_email (선택)             │
  author_id (UUID, 선택)                           │
  is_hidden, view_count                           │
  search_vector (TSVECTOR, GEN STORED)            │
  created_at, updated_at                          │
        │                                         │
        │ 1:N (linked_app_id)                     │
        ▼                                         │
vc_request_posts ─────────────────────────────────┤
  id (PK)                                         │
  title, content (markdown)                       │
  request_type (enum)                             │
  status (enum, default: 'requested')             │
  linked_app_id (FK → vc_apps, 선택)              │
  author_nickname, author_email (선택)             │
  is_hidden, view_count                           │
  search_vector (TSVECTOR, GEN STORED)            │
  created_at, updated_at                          │
        │                                         │
        │ 1:N (post_id)                           │
        ▼                                         │
vc_request_comments                               │
  id (PK)                                         │
  post_id (FK → vc_request_posts)                 │
  parent_id (FK → vc_request_comments, 선택)      │
  depth (0~2, CHECK depth <= 2)                   │
  content                                         │
  author_nickname, author_email (선택)             │
  is_hidden                                       │
  created_at, updated_at                          │
                                                  │
vc_info_cards ────────────────────────────────────┤
  id (PK)                                         │
  title, summary                                  │
  markdown_content (선택)                          │
  author_nickname, author_email (선택)             │
  is_hidden, view_count                           │
  created_at, updated_at                          │
        │                                         │
        │ 1:N (card_id, 최대 20장)                 │
        ▼                                         │
vc_info_slides                                    │
  id (PK)                                         │
  card_id (FK → vc_info_cards)                    │
  slide_url (Storage URL)                         │
  alt_text (선택)                                  │
  sort_order                                      │
  created_at                                      │
                                                  │
vc_links ─────────────────────────────────────────┘
  id (PK)
  title, url, description (선택)
  category (enum: tool/document/community/video/other)
  author_nickname, author_email (선택)
  is_hidden
  created_at, updated_at

vc_admin_settings
  id (PK)
  key (UNIQUE)
  value (text)
  updated_at

vc_magic_link_tokens
  id (PK)
  token (UNIQUE)
  email
  content_type ('app'/'request'/'info'/'link')
  content_id (UUID)
  expires_at (발급 후 15분)
  used_at (사용 후 무효화)
```

---

## Enum 타입

| Enum | 값 |
|------|----|
| `vibe_tool` | `'Claude Code'`, `'Cursor'`, `'Windsurf'`, `'v0'`, `'Bolt'`, `'Replit'`, `'기타'` |
| `app_level` | `'beginner'`, `'intermediate'`, `'advanced'` |
| `request_type` | `'general'`, `'app_feedback'`, `'app_error'`, `'app_update'` |
| `request_status` | `'requested'`, `'in_progress'`, `'completed'`, `'closed'` |
| `link_category` | `'tool'`, `'document'`, `'community'`, `'video'`, `'other'` |
| `content_type` | `'app'`, `'request'`, `'info'`, `'link'` |

---

## 주요 제약

| 테이블 | 제약 |
|--------|------|
| `vc_apps` | `vibe_tool IN (...)` CHECK |
| `vc_request_comments` | `depth >= 0 AND depth <= 2` CHECK |
| `vc_links` | `category IN (...)` CHECK |
| `vc_magic_link_tokens` | `content_type IN ('app','request','info','link')` CHECK |
| `vc_info_slides` | 카드당 최대 20장 (서버 사이드 검증) |

---

## RLS 정책 요약

| 테이블 | anon SELECT | anon INSERT | UPDATE/DELETE |
|--------|-------------|-------------|---------------|
| `vc_apps` | `is_hidden = false` | 허용 | service_role만 |
| `vc_request_posts` | `is_hidden = false` | 허용 | service_role만 |
| `vc_request_comments` | `is_hidden = false` | 허용 | service_role만 |
| `vc_info_cards` | `is_hidden = false` | 허용 | service_role만 |
| `vc_info_slides` | 항상 허용 | 허용 | service_role만 |
| `vc_links` | `is_hidden = false` | 허용 | service_role만 |
| `vc_admin_settings` | 허용 | 불가 | service_role만 |
| `vc_magic_link_tokens` | 불가 | 불가 | service_role만 |

---

## Storage 버킷

| 버킷 | 용도 | 크기 제한 | MIME 제한 |
|------|------|-----------|-----------|
| `app-screenshots` | 앱 스크린샷 | 5MB | image/* |
| `info-slides` | 정보 공유 슬라이드 | 5MB | image/* |

---

## FTS 설정

```sql
-- vc_apps search_vector
ALTER TABLE vc_apps
  ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,''))
  ) STORED;

CREATE INDEX ON vc_apps USING gin(search_vector);
CREATE INDEX ON vc_apps USING gin(title gin_trgm_ops);  -- pg_trgm 폴백용
```
