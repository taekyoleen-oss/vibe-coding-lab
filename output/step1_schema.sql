-- =============================================================================
-- 비개발자의 개발실 (Vibe Code Lab) — Database Schema
-- Project  : 비개발자의 개발실
-- Version  : v1.7
-- Generated: 2026-03-13
-- Target   : Supabase (PostgreSQL 15+)
-- =============================================================================
-- Execution order:
--   1. Extensions
--   2. Tables (dependency order)
--   3. Indexes
--   4. RLS (enable + policies)
--   5. Storage buckets
--   6. Seed data (vc_admin_settings)
--   7. Table comments
-- =============================================================================


-- =============================================================================
-- 1. EXTENSIONS
-- =============================================================================

-- Full-text search with trigram (partial match + typo tolerance)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- pgvector — for future embedding support (v2.0)
CREATE EXTENSION IF NOT EXISTS vector;


-- =============================================================================
-- 2. TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 2-1. vc_apps
--      공유 앱 정보. 누구나 등록 가능, 관리자만 수정/삭제/숨김.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vc_apps (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text        NOT NULL,
  description      text        NOT NULL,
  level            text        CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  screenshot_url   text,                          -- Supabase Storage URL (vc-app-screenshots)
  app_url          text        NOT NULL,          -- 앱 웹페이지 링크 (https:// 형식)
  uses_api_key     boolean     NOT NULL DEFAULT false,
  initial_prompt   text,                          -- 최초 개발 프롬프트 (전체 공개)
  markdown_content text,                          -- 앱 설명 마크다운
  vibe_tool        text        CHECK (vibe_tool IN (
                                 'Claude Code',
                                 'Cursor',
                                 'Windsurf',
                                 'v0',
                                 'Bolt',
                                 'Replit',
                                 '기타'
                               )),
  author_nickname  text        NOT NULL,
  author_email     text,                          -- 비공개. API 응답에서 제외할 것.
  author_id        uuid,                          -- 추후 auth.users 연동용 (NULL 허용)
  is_hidden        boolean     NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  -- FTS: 'simple' 사전 — 한국어/영어 혼용 환경에서 안전한 범용 설정
  search_vector    tsvector    GENERATED ALWAYS AS (
                     to_tsvector('simple',
                       coalesce(title,           '') || ' ' ||
                       coalesce(description,     '') || ' ' ||
                       coalesce(initial_prompt,  '') || ' ' ||
                       coalesce(vibe_tool,       '')
                     )
                   ) STORED,

  -- pgvector: v2.0 임베딩 준비 (현재는 NULL)
  embedding        vector(1536)
);


-- -----------------------------------------------------------------------------
-- 2-2. vc_request_posts
--      개발요청 게시글. linked_app_id로 앱과 연결 가능.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vc_request_posts (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text        NOT NULL,
  content         text        NOT NULL,
  request_type    text        NOT NULL DEFAULT 'general'
                              CHECK (request_type IN (
                                'general',       -- 일반 개발요청
                                'app_feedback',  -- 앱 추가요청/개선 제안
                                'app_error',     -- 앱 에러 제보
                                'app_update'     -- 앱 업데이트 논의
                              )),
  linked_app_id   uuid        REFERENCES vc_apps(id) ON DELETE SET NULL,
  status          text        NOT NULL DEFAULT 'requested'
                              CHECK (status IN (
                                'requested',
                                'in_progress',
                                'completed',
                                'closed'
                              )),
  view_count      integer     NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  author_nickname text        NOT NULL,
  author_email    text,                          -- 비공개. API 응답에서 제외할 것.
  author_id       uuid,                          -- 추후 auth.users 연동용 (NULL 허용)
  is_hidden       boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  -- FTS: 요청 제목 + 본문
  search_vector   tsvector    GENERATED ALWAYS AS (
                    to_tsvector('simple',
                      coalesce(title,   '') || ' ' ||
                      coalesce(content, '')
                    )
                  ) STORED
);


-- -----------------------------------------------------------------------------
-- 2-3. vc_request_comments
--      개발요청 댓글. 스레드형, 최대 depth 2.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vc_request_comments (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         uuid        NOT NULL REFERENCES vc_request_posts(id) ON DELETE CASCADE,
  parent_id       uuid        REFERENCES vc_request_comments(id) ON DELETE CASCADE,
  content         text        NOT NULL,
  depth           integer     NOT NULL DEFAULT 0
                              CHECK (depth >= 0 AND depth <= 2),
  author_nickname text        NOT NULL,
  author_email    text,                          -- 비공개. API 응답에서 제외할 것.
  author_id       uuid,                          -- 추후 auth.users 연동용 (NULL 허용)
  is_hidden       boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
  -- updated_at 생략: 댓글은 수정 기능 없음 (삭제만 허용)
);


-- -----------------------------------------------------------------------------
-- 2-4. vc_info_cards
--      정보 공유 가이드 카드. 마크다운 또는 슬라이드 이미지.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vc_info_cards (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text        NOT NULL,
  summary          text,                          -- 카드 목록 썸네일용 요약
  content_type     text        NOT NULL
                               CHECK (content_type IN ('slides', 'markdown')),
  markdown_content text,                          -- content_type = 'markdown' 일 때 사용
  display_order    integer     NOT NULL DEFAULT 0,
  author_nickname  text        NOT NULL,
  author_email     text,                          -- 비공개. API 응답에서 제외할 것.
  author_id        uuid,                          -- 추후 auth.users 연동용 (NULL 허용)
  is_hidden        boolean     NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);


-- -----------------------------------------------------------------------------
-- 2-5. vc_info_slides
--      정보 카드 내 슬라이드 이미지. 카드당 최대 20장 (서버 사이드 검증).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vc_info_slides (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id     uuid    NOT NULL REFERENCES vc_info_cards(id) ON DELETE CASCADE,
  slide_url   text    NOT NULL,                  -- Supabase Storage URL (vc-info-slides)
  slide_order integer NOT NULL,
  alt_text    text,

  CONSTRAINT uq_info_slides_card_order UNIQUE (card_id, slide_order)
);


-- -----------------------------------------------------------------------------
-- 2-6. vc_links
--      바이브 코딩 관련 외부 참고 링크.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vc_links (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text        NOT NULL,
  description     text,
  url             text        NOT NULL,
  category        text        NOT NULL DEFAULT 'other'
                              CHECK (category IN (
                                'tool',
                                'document',
                                'community',
                                'video',
                                'other'
                              )),
  icon_url        text,                          -- 파비콘 또는 로고 URL
  display_order   integer     NOT NULL DEFAULT 0,
  author_nickname text        NOT NULL,
  author_id       uuid,                          -- 추후 auth.users 연동용 (NULL 허용)
  is_hidden       boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);


-- -----------------------------------------------------------------------------
-- 2-7. vc_admin_settings
--      관리자 API 기능 ON/OFF 등 키-값 설정 저장.
--      SELECT는 anon 허용 (프론트에서 기능 활성화 여부 확인에 필요).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vc_admin_settings (
  key        text        PRIMARY KEY,            -- 설정 키 (예: 'ai_refine_enabled')
  value      text        NOT NULL,               -- 설정 값 ('true' / 'false' / 기타)
  label      text,                               -- 관리자 대시보드 표시용 이름
  updated_at timestamptz NOT NULL DEFAULT now()
);


-- -----------------------------------------------------------------------------
-- 2-8. vc_magic_link_tokens
--      콘텐츠 소유권 인증용 Magic Link 토큰.
--      서버 사이드 service_role 전용 — anon 접근 전면 차단.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vc_magic_link_tokens (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  token        text        UNIQUE NOT NULL,      -- 랜덤 UUID 토큰 (gen_random_uuid()::text)
  email        text        NOT NULL,             -- 인증 요청한 이메일
  content_type text        NOT NULL
               CHECK (content_type IN ('app', 'request', 'info', 'link')),
  content_id   uuid        NOT NULL,             -- 수정 대상 콘텐츠 ID
  expires_at   timestamptz NOT NULL,             -- 발급 후 15분
  used_at      timestamptz                       -- 사용 시 기록 (재사용 방지, NULL = 미사용)
);


-- =============================================================================
-- 3. INDEXES
-- =============================================================================

-- vc_apps ──────────────────────────────────────────────────────────────────────

-- GIN index for FTS (@@)
CREATE INDEX IF NOT EXISTS idx_vc_apps_search
  ON vc_apps USING GIN (search_vector);

-- GIN trigram index for partial/fuzzy match on title + description
CREATE INDEX IF NOT EXISTS idx_vc_apps_trgm
  ON vc_apps USING GIN ((title || ' ' || description) gin_trgm_ops);

-- Filtering by level & visibility (common list queries)
CREATE INDEX IF NOT EXISTS idx_vc_apps_level_hidden
  ON vc_apps (level, is_hidden, created_at DESC);

-- pgvector HNSW index (for embedding similarity search — v2.0 준비)
-- Note: Only creates meaningful benefit once embeddings are populated.
-- CREATE INDEX IF NOT EXISTS idx_vc_apps_embedding
--   ON vc_apps USING hnsw (embedding vector_cosine_ops);


-- vc_request_posts ─────────────────────────────────────────────────────────────

-- GIN index for FTS
CREATE INDEX IF NOT EXISTS idx_vc_request_posts_search
  ON vc_request_posts USING GIN (search_vector);

-- GIN trigram index on title
CREATE INDEX IF NOT EXISTS idx_vc_request_posts_trgm
  ON vc_request_posts USING GIN (title gin_trgm_ops);

-- Linked app filter (앱 상세에서 '이 앱의 요청' 탭)
CREATE INDEX IF NOT EXISTS idx_vc_request_posts_linked_app
  ON vc_request_posts (linked_app_id, is_hidden, created_at DESC)
  WHERE linked_app_id IS NOT NULL;

-- Status + visibility (관리자 대시보드)
CREATE INDEX IF NOT EXISTS idx_vc_request_posts_status
  ON vc_request_posts (status, is_hidden, created_at DESC);


-- vc_request_comments ──────────────────────────────────────────────────────────

-- Post + thread traversal (게시글 댓글 목록 로딩)
CREATE INDEX IF NOT EXISTS idx_vc_request_comments_post
  ON vc_request_comments (post_id, depth, created_at ASC);

-- Parent traversal (대댓글 목록)
CREATE INDEX IF NOT EXISTS idx_vc_request_comments_parent
  ON vc_request_comments (parent_id, created_at ASC)
  WHERE parent_id IS NOT NULL;


-- vc_info_cards ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_vc_info_cards_order
  ON vc_info_cards (display_order ASC, created_at DESC)
  WHERE is_hidden = false;


-- vc_info_slides ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_vc_info_slides_card
  ON vc_info_slides (card_id, slide_order ASC);


-- vc_links ─────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_vc_links_category
  ON vc_links (category, display_order ASC, created_at DESC)
  WHERE is_hidden = false;


-- vc_magic_link_tokens ─────────────────────────────────────────────────────────

-- Token lookup (인증 요청 시 즉시 조회)
-- token column already has UNIQUE index; add covering index for expiry check
CREATE INDEX IF NOT EXISTS idx_vc_magic_link_tokens_token_expires
  ON vc_magic_link_tokens (token, expires_at)
  WHERE used_at IS NULL;

-- Cleanup old tokens (expired + used 정리용)
CREATE INDEX IF NOT EXISTS idx_vc_magic_link_tokens_expires
  ON vc_magic_link_tokens (expires_at);


-- =============================================================================
-- 4. ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on all tables ─────────────────────────────────────────────────────
ALTER TABLE vc_apps                ENABLE ROW LEVEL SECURITY;
ALTER TABLE vc_request_posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE vc_request_comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE vc_info_cards          ENABLE ROW LEVEL SECURITY;
ALTER TABLE vc_info_slides         ENABLE ROW LEVEL SECURITY;
ALTER TABLE vc_links               ENABLE ROW LEVEL SECURITY;
ALTER TABLE vc_admin_settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE vc_magic_link_tokens   ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────────────────────
-- vc_apps
-- ─────────────────────────────────────────────────────────────────────────────

-- anon: 숨김 처리되지 않은 앱만 조회
CREATE POLICY "vc_apps__anon_select"
  ON vc_apps FOR SELECT
  USING (is_hidden = false);

-- anon: 누구나 앱 등록 가능 (Rate Limit은 서버 사이드에서 처리)
CREATE POLICY "vc_apps__anon_insert"
  ON vc_apps FOR INSERT
  WITH CHECK (true);

-- anon: UPDATE 전면 차단 (service_role은 RLS 무시하므로 정책 불필요)
CREATE POLICY "vc_apps__no_update_for_anon"
  ON vc_apps FOR UPDATE
  USING (false);

-- anon: DELETE 전면 차단
CREATE POLICY "vc_apps__no_delete_for_anon"
  ON vc_apps FOR DELETE
  USING (false);


-- ─────────────────────────────────────────────────────────────────────────────
-- vc_request_posts
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "vc_request_posts__anon_select"
  ON vc_request_posts FOR SELECT
  USING (is_hidden = false);

CREATE POLICY "vc_request_posts__anon_insert"
  ON vc_request_posts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "vc_request_posts__no_update_for_anon"
  ON vc_request_posts FOR UPDATE
  USING (false);

CREATE POLICY "vc_request_posts__no_delete_for_anon"
  ON vc_request_posts FOR DELETE
  USING (false);


-- ─────────────────────────────────────────────────────────────────────────────
-- vc_request_comments
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "vc_request_comments__anon_select"
  ON vc_request_comments FOR SELECT
  USING (is_hidden = false);

CREATE POLICY "vc_request_comments__anon_insert"
  ON vc_request_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "vc_request_comments__no_update_for_anon"
  ON vc_request_comments FOR UPDATE
  USING (false);

CREATE POLICY "vc_request_comments__no_delete_for_anon"
  ON vc_request_comments FOR DELETE
  USING (false);


-- ─────────────────────────────────────────────────────────────────────────────
-- vc_info_cards
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "vc_info_cards__anon_select"
  ON vc_info_cards FOR SELECT
  USING (is_hidden = false);

CREATE POLICY "vc_info_cards__anon_insert"
  ON vc_info_cards FOR INSERT
  WITH CHECK (true);

CREATE POLICY "vc_info_cards__no_update_for_anon"
  ON vc_info_cards FOR UPDATE
  USING (false);

CREATE POLICY "vc_info_cards__no_delete_for_anon"
  ON vc_info_cards FOR DELETE
  USING (false);


-- ─────────────────────────────────────────────────────────────────────────────
-- vc_info_slides
--   슬라이드는 카드와 함께 조회되므로, 카드의 is_hidden 상태를 join으로 확인.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "vc_info_slides__anon_select"
  ON vc_info_slides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vc_info_cards c
      WHERE c.id = card_id
        AND c.is_hidden = false
    )
  );

CREATE POLICY "vc_info_slides__anon_insert"
  ON vc_info_slides FOR INSERT
  WITH CHECK (true);

CREATE POLICY "vc_info_slides__no_update_for_anon"
  ON vc_info_slides FOR UPDATE
  USING (false);

CREATE POLICY "vc_info_slides__no_delete_for_anon"
  ON vc_info_slides FOR DELETE
  USING (false);


-- ─────────────────────────────────────────────────────────────────────────────
-- vc_links
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "vc_links__anon_select"
  ON vc_links FOR SELECT
  USING (is_hidden = false);

CREATE POLICY "vc_links__anon_insert"
  ON vc_links FOR INSERT
  WITH CHECK (true);

CREATE POLICY "vc_links__no_update_for_anon"
  ON vc_links FOR UPDATE
  USING (false);

CREATE POLICY "vc_links__no_delete_for_anon"
  ON vc_links FOR DELETE
  USING (false);


-- ─────────────────────────────────────────────────────────────────────────────
-- vc_admin_settings
--   SELECT는 anon 허용 (프론트에서 AI 기능 ON/OFF 상태 확인 필요).
--   INSERT/UPDATE/DELETE는 service_role 전용.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "vc_admin_settings__anon_select"
  ON vc_admin_settings FOR SELECT
  USING (true);

CREATE POLICY "vc_admin_settings__no_insert_for_anon"
  ON vc_admin_settings FOR INSERT
  WITH CHECK (false);

CREATE POLICY "vc_admin_settings__no_update_for_anon"
  ON vc_admin_settings FOR UPDATE
  USING (false);

CREATE POLICY "vc_admin_settings__no_delete_for_anon"
  ON vc_admin_settings FOR DELETE
  USING (false);


-- ─────────────────────────────────────────────────────────────────────────────
-- vc_magic_link_tokens
--   모든 anon 접근 전면 차단. service_role만 접근.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "vc_magic_link_tokens__no_anon_access"
  ON vc_magic_link_tokens FOR ALL
  USING (false)
  WITH CHECK (false);


-- =============================================================================
-- 5. STORAGE BUCKETS
-- =============================================================================
-- Supabase Storage 버킷은 SQL이 아닌 Supabase Storage API로 생성합니다.
-- 아래는 참고용 INSERT 구문입니다 (supabase_storage_admin 역할 필요).
-- 실제 생성은 Supabase Dashboard → Storage → New Bucket 또는 CLI 사용.
-- =============================================================================

-- app-screenshots: 앱 스크린샷 (공개, 최대 5MB, image/* 허용)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-screenshots',
  'app-screenshots',
  true,
  5242880,                                       -- 5MB (5 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- info-slides: 정보 공유 슬라이드 이미지 (공개, 최대 5MB, image/* 허용)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'info-slides',
  'info-slides',
  true,
  5242880,                                       -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS: 공개 읽기 허용, 업로드는 anon 허용, 삭제는 service_role 전용

-- app-screenshots: public read
CREATE POLICY "app_screenshots__public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'app-screenshots');

-- app-screenshots: anon upload
CREATE POLICY "app_screenshots__anon_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'app-screenshots');

-- app-screenshots: block anon delete
CREATE POLICY "app_screenshots__no_anon_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'app-screenshots' AND false);

-- info-slides: public read
CREATE POLICY "info_slides__public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'info-slides');

-- info-slides: anon upload
CREATE POLICY "info_slides__anon_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'info-slides');

-- info-slides: block anon delete
CREATE POLICY "info_slides__no_anon_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'info-slides' AND false);


-- =============================================================================
-- 6. SEED DATA — vc_admin_settings
-- =============================================================================

INSERT INTO vc_admin_settings (key, value, label) VALUES
  ('ai_refine_enabled', 'true', 'AI 글 다듬기 (앱 등록 폼)')
ON CONFLICT (key) DO NOTHING;


-- =============================================================================
-- 7. TABLE & COLUMN COMMENTS
-- =============================================================================

COMMENT ON TABLE vc_apps IS
  '공유 앱 정보. 누구나 등록 가능, 관리자만 수정/삭제/숨김 처리 가능.';
COMMENT ON COLUMN vc_apps.author_email IS
  '등록자 이메일 (선택 입력, 비공개). API 응답에서 반드시 제외할 것. Magic Link 수정 인증에 사용.';
COMMENT ON COLUMN vc_apps.vibe_tool IS
  '사용한 바이브 코딩 툴. 고정 선택지: Claude Code / Cursor / Windsurf / v0 / Bolt / Replit / 기타';
COMMENT ON COLUMN vc_apps.is_hidden IS
  '관리자 숨김 처리 (소프트 삭제). true이면 anon SELECT에서 제외됨.';
COMMENT ON COLUMN vc_apps.embedding IS
  'pgvector 임베딩 (v2.0 준비). 현재는 NULL. 차원수: 1536 (OpenAI ada-002 호환).';

COMMENT ON TABLE vc_request_posts IS
  '개발요청 게시글. linked_app_id로 특정 앱과 연결 가능. 앱 삭제 시 NULL로 변경됨.';
COMMENT ON COLUMN vc_request_posts.linked_app_id IS
  '연결된 앱 ID. 앱 카드에서 요청 시 자동 세팅, 게시판 직접 작성 시 NULL.';
COMMENT ON COLUMN vc_request_posts.view_count IS
  '조회수. 서버 사이드에서 service_role로 increment.';
COMMENT ON COLUMN vc_request_posts.author_email IS
  '등록자 이메일 (선택 입력, 비공개). API 응답에서 반드시 제외할 것.';

COMMENT ON TABLE vc_request_comments IS
  '개발요청 댓글. 스레드형 대댓글 지원, 최대 depth 2.';
COMMENT ON COLUMN vc_request_comments.depth IS
  '댓글 깊이: 0=최상위, 1=대댓글, 2=대대댓글. 최대 2까지 허용.';
COMMENT ON COLUMN vc_request_comments.parent_id IS
  '부모 댓글 ID. 최상위 댓글은 NULL.';

COMMENT ON TABLE vc_info_cards IS
  '정보 공유 가이드 카드. content_type으로 슬라이드(이미지) 또는 마크다운 선택.';
COMMENT ON COLUMN vc_info_cards.display_order IS
  '관리자가 순서 조정. 낮을수록 상단 노출.';

COMMENT ON TABLE vc_info_slides IS
  '정보 카드 슬라이드 이미지. 카드당 최대 20장 (서버 사이드에서 검증).';

COMMENT ON TABLE vc_links IS
  '바이브 코딩 관련 외부 참고 링크 모음.';

COMMENT ON TABLE vc_admin_settings IS
  '관리자 API 기능 ON/OFF 설정. SELECT는 anon 허용 (프론트 기능 표시용).';
COMMENT ON COLUMN vc_admin_settings.key IS
  '설정 키. 예: ai_refine_enabled';
COMMENT ON COLUMN vc_admin_settings.value IS
  '설정 값. true / false 또는 기타 문자열.';

COMMENT ON TABLE vc_magic_link_tokens IS
  '콘텐츠 소유권 인증용 Magic Link 토큰. service_role 전용, anon 접근 전면 차단.';
COMMENT ON COLUMN vc_magic_link_tokens.token IS
  '랜덤 UUID 토큰 문자열. 이메일 링크에 포함하여 전송.';
COMMENT ON COLUMN vc_magic_link_tokens.expires_at IS
  '토큰 만료 시각. 발급 후 15분.';
COMMENT ON COLUMN vc_magic_link_tokens.used_at IS
  '토큰 사용 시각. NULL이면 미사용. 재사용 방지를 위해 사용 즉시 기록.';

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
