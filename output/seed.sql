-- =============================================================================
-- 비개발자의 개발실 (Vibe Code Lab) — Seed Data
-- Version  : v1.7
-- Generated: 2026-03-13
-- Purpose  : 개발·스테이징 환경 초기 데이터. 프로덕션 적용 전 반드시 검토.
-- =============================================================================
-- 실행 전 확인:
--   1. step1_schema.sql 이 먼저 실행되어 있어야 합니다.
--   2. 이미지 URL은 실제 Supabase Storage URL로 교체하세요.
--   3. 프로덕션 환경에서는 author_email 값을 더미로 유지하거나 제거하세요.
-- =============================================================================


-- =============================================================================
-- 1. vc_apps — 공유 앱 샘플 (5건)
-- =============================================================================

INSERT INTO vc_apps (
  id, title, description, level, screenshot_url, app_url,
  uses_api_key, initial_prompt, markdown_content, vibe_tool,
  author_nickname, author_email, is_hidden
) VALUES

-- 초급: 할일 목록 앱
(
  gen_random_uuid(),
  '깔끔한 할일 목록',
  '오늘 할 일을 간단하게 정리하는 미니멀 Todo 앱입니다. 완료 체크 및 삭제 기능을 지원합니다.',
  'beginner',
  NULL,
  'https://todo-clean.vercel.app',
  false,
  '간단한 할일 목록 앱을 만들어줘. 할일 추가, 완료 체크, 삭제 기능이 있고 디자인은 미니멀하게.',
  E'## 앱 소개\n오늘 해야 할 일을 간편하게 기록하고 관리하는 미니멀 Todo 앱입니다.\n\n## 주요 기능\n- 할일 텍스트 입력 및 추가\n- 완료 체크 토글\n- 항목 삭제\n- 로컬스토리지 저장 (새로고침 후에도 유지)\n\n## 사용 방법\n1. 상단 입력창에 할일을 입력하세요.\n2. Enter 또는 추가 버튼을 누르세요.\n3. 항목 왼쪽 체크박스를 클릭하면 완료 처리됩니다.\n\n## 개발 배경\n기존 앱들이 너무 복잡해서 딱 필요한 기능만 있는 앱을 만들어봤습니다.\n\n## 참고 사항\n- API KEY 불필요\n- 외부 서버 없이 브라우저에서만 동작',
  'Bolt',
  '바이브개발자',
  NULL,
  false
),

-- 초급: 단위 변환 계산기
(
  gen_random_uuid(),
  '단위 변환 계산기',
  '길이, 무게, 온도 등 자주 쓰는 단위를 빠르게 변환해 주는 계산기입니다.',
  'beginner',
  NULL,
  'https://unit-converter-vibe.vercel.app',
  false,
  '길이(m, cm, km, inch, feet), 무게(kg, g, lb), 온도(섭씨, 화씨, 켈빈) 변환 계산기 만들어줘.',
  E'## 앱 소개\n길이, 무게, 온도 단위를 손쉽게 변환해 주는 계산기 앱입니다.\n\n## 주요 기능\n- 길이: m, cm, km, inch, feet, mile\n- 무게: kg, g, mg, lb, oz\n- 온도: 섭씨(℃), 화씨(℉), 켈빈(K)\n- 실시간 변환 (입력 즉시 결과 표시)\n\n## 사용 방법\n1. 상단 탭에서 변환 카테고리를 선택하세요.\n2. 변환할 값을 입력하고 단위를 선택하세요.\n3. 모든 단위의 변환 결과가 동시에 표시됩니다.\n\n## 개발 배경\n요리할 때 lb를 kg으로 변환하는 게 귀찮아서 만들었습니다.\n\n## 참고 사항\n- API KEY 불필요\n- 오프라인에서도 동작',
  'v0',
  '코딩무지개',
  NULL,
  false
),

-- 중급: 환율 계산기
(
  gen_random_uuid(),
  '실시간 환율 계산기',
  '공개 환율 API를 활용해 실시간 환율을 조회하고 여러 통화를 동시에 비교하는 앱입니다.',
  'intermediate',
  NULL,
  'https://exchange-rate-vibe.vercel.app',
  false,
  '실시간 환율 계산기를 만들어줘. 무료 API(exchangerate-api.com)를 사용해서 KRW, USD, EUR, JPY, CNY 환율을 보여주고, 금액 입력하면 바로 변환되게 해줘.',
  E'## 앱 소개\n무료 환율 API를 연동하여 실시간 환율을 조회하고 여러 통화를 동시에 비교할 수 있는 앱입니다.\n\n## 주요 기능\n- KRW, USD, EUR, JPY, CNY, GBP 실시간 환율 조회\n- 금액 입력 시 모든 통화 동시 변환\n- 최근 조회 기준 시각 표시\n- 캐싱으로 불필요한 API 호출 최소화\n\n## 사용 방법\n1. 기준 통화와 금액을 입력하세요.\n2. 나머지 통화의 변환 금액이 자동으로 표시됩니다.\n3. 환율은 1시간마다 갱신됩니다.\n\n## 개발 배경\n해외여행 준비 중에 환율 계산기가 필요해서 직접 만들었습니다.\n\n## 참고 사항\n- exchangerate-api.com 무료 플랜 사용 (월 1,500회 제한)\n- API KEY 필요: 회원가입 후 무료 KEY 발급 가능',
  'Cursor',
  '여행준비생',
  NULL,
  false
),

-- 중급: 마크다운 에디터
(
  gen_random_uuid(),
  '실시간 마크다운 에디터',
  '왼쪽에 마크다운을 입력하면 오른쪽에 실시간으로 미리보기가 표시되는 에디터입니다. 내보내기도 지원합니다.',
  'intermediate',
  NULL,
  'https://md-editor-vibe.vercel.app',
  false,
  '마크다운 에디터 만들어줘. 왼쪽 입력창, 오른쪽 미리보기 실시간으로 보이게. HTML/PDF 내보내기도 되면 좋겠어.',
  E'## 앱 소개\n실시간으로 마크다운 미리보기를 제공하는 웹 에디터입니다. 작성한 내용을 HTML 또는 PDF로 내보낼 수 있습니다.\n\n## 주요 기능\n- 분할 화면 (입력 / 미리보기)\n- 실시간 렌더링 (marked.js 사용)\n- 코드 하이라이팅 (highlight.js)\n- HTML 다운로드\n- PDF 인쇄\n- 로컬스토리지 자동 저장\n\n## 사용 방법\n1. 왼쪽 편집창에 마크다운을 입력하세요.\n2. 오른쪽에서 실시간으로 결과를 확인하세요.\n3. 상단 버튼으로 HTML 저장 또는 PDF 출력이 가능합니다.\n\n## 개발 배경\n노션 대신 가볍게 쓸 수 있는 에디터가 필요했습니다.\n\n## 참고 사항\n- API KEY 불필요\n- 브라우저에서만 동작 (서버리스)',
  'Claude Code',
  '문서작성러',
  'writer@example.com',
  false
),

-- 고급: 포모도로 타이머 + 통계
(
  gen_random_uuid(),
  '포모도로 타이머 & 집중 통계',
  '포모도로 기법으로 집중력을 높이고, 일별/주별 집중 시간을 Supabase DB에 저장해 통계로 확인할 수 있는 앱입니다.',
  'advanced',
  NULL,
  'https://pomodoro-stats-vibe.vercel.app',
  false,
  '포모도로 타이머 앱 만들어줘. 25분 집중 + 5분 휴식 기본 설정. 완료한 세션을 Supabase DB에 저장해서 일별/주별 집중 시간 통계를 차트로 보여줘.',
  E'## 앱 소개\n포모도로 기법(25분 집중 + 5분 휴식)으로 작업 집중력을 높이고, 집중 이력을 DB에 기록하여 주간 통계를 확인할 수 있는 앱입니다.\n\n## 주요 기능\n- 포모도로 타이머 (집중 25분, 짧은 휴식 5분, 긴 휴식 15분)\n- 타이머 종료 시 브라우저 알림\n- 세션 완료 이력 Supabase 저장\n- 일별/주별 집중 시간 Bar 차트 (Chart.js)\n- 연속 집중 기록 뱃지\n\n## 사용 방법\n1. 닉네임을 입력하고 시작하세요.\n2. 시작 버튼을 누르면 25분 타이머가 시작됩니다.\n3. 타이머 종료 시 자동으로 세션이 기록됩니다.\n4. 하단 통계 탭에서 집중 기록을 확인하세요.\n\n## 개발 배경\n스스로 집중 시간을 추적하고 싶어서 만들었습니다.\n\n## 참고 사항\n- Supabase 프로젝트 URL과 anon key 필요\n- 브라우저 알림 권한 허용 필요',
  'Windsurf',
  '집중왕',
  NULL,
  false
);


-- =============================================================================
-- 2. vc_request_posts — 개발요청 샘플 (5건)
-- =============================================================================

INSERT INTO vc_request_posts (
  id, title, content, request_type, linked_app_id,
  status, view_count, author_nickname, author_email, is_hidden
) VALUES

(
  gen_random_uuid(),
  '간단한 가계부 앱이 있으면 좋겠어요',
  E'수입/지출을 카테고리별로 기록하고 월별 합계를 볼 수 있는 가계부 앱을 누가 만들어줄 수 있을까요?\n\n원하는 기능:\n- 수입/지출 구분 입력\n- 카테고리 설정 (식비, 교통, 쇼핑 등)\n- 월별 요약 차트\n- 데이터 CSV 내보내기',
  'general',
  NULL,
  'requested',
  42,
  '절약고수',
  NULL,
  false
),

(
  gen_random_uuid(),
  '영어 단어 플래시카드 앱 요청합니다',
  E'영어 단어를 외울 수 있는 플래시카드 앱이 필요합니다.\n\n앞면에 영어, 뒷면에 한국어가 나오고 스와이프로 넘기는 방식이면 좋겠어요. 틀린 단어는 다시 복습할 수 있게요.\n\n스펙:\n- 직접 단어 추가 가능\n- 알고 있는 단어 / 모르는 단어 분류\n- 틀린 단어만 다시 보기 모드',
  'general',
  NULL,
  'in_progress',
  89,
  '영어공부중',
  'english@example.com',
  false
),

(
  gen_random_uuid(),
  '포모도로 앱에 태그 기능 추가 요청',
  E'포모도로 타이머 앱 잘 사용하고 있어요!\n\n세션에 태그(예: 공부, 업무, 운동)를 달 수 있으면 더 좋을 것 같아요. 태그별 통계도 보고 싶습니다.',
  'app_feedback',
  (SELECT id FROM vc_apps WHERE title = '포모도로 타이머 & 집중 통계' LIMIT 1),
  'requested',
  23,
  '태그매니아',
  NULL,
  false
),

(
  gen_random_uuid(),
  '레시피 관리 앱 있으면 좋겠어요',
  E'냉장고에 있는 재료를 입력하면 만들 수 있는 레시피를 추천해주는 앱은 어떨까요?\n\nClaude API를 써서 재료 기반으로 레시피를 생성해주는 방식으로 만들면 재미있을 것 같아요!',
  'general',
  NULL,
  'requested',
  67,
  '요리초보',
  'cook@example.com',
  false
),

(
  gen_random_uuid(),
  '마크다운 에디터 테이블 편집 기능 버그 제보',
  E'마크다운 에디터 앱에서 표(table)를 입력하면 미리보기가 제대로 렌더링되지 않아요.\n\n재현 방법:\n1. | 헤더1 | 헤더2 | 입력\n2. | --- | --- | 입력\n3. | 값1 | 값2 | 입력\n\n예상: 표로 렌더링\n실제: 텍스트 그대로 출력\n\n브라우저: Chrome 122',
  'app_error',
  (SELECT id FROM vc_apps WHERE title = '실시간 마크다운 에디터' LIMIT 1),
  'in_progress',
  31,
  '버그헌터',
  'bug@example.com',
  false
);


-- =============================================================================
-- 3. vc_request_comments — 댓글 샘플 (depth 0, 1, 2 포함)
-- =============================================================================

-- 첫 번째 요청의 댓글
WITH post AS (
  SELECT id FROM vc_request_posts WHERE title = '간단한 가계부 앱이 있으면 좋겠어요' LIMIT 1
),
comment1 AS (
  INSERT INTO vc_request_comments (id, post_id, parent_id, content, depth, author_nickname)
  VALUES (
    gen_random_uuid(),
    (SELECT id FROM post),
    NULL,
    '저도 이런 앱 필요했어요! CSV 내보내기가 특히 유용할 것 같네요.',
    0,
    '동감이요'
  )
  RETURNING id
),
comment2 AS (
  INSERT INTO vc_request_comments (id, post_id, parent_id, content, depth, author_nickname)
  VALUES (
    gen_random_uuid(),
    (SELECT id FROM post),
    NULL,
    '제가 한번 도전해볼게요. Bolt로 빠르게 만들어볼 수 있을 것 같아요.',
    0,
    '도전러'
  )
  RETURNING id
)
INSERT INTO vc_request_comments (id, post_id, parent_id, content, depth, author_nickname)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM post),
  (SELECT id FROM comment2),
  '정말요?! 만들어주시면 꼭 써볼게요 감사해요 :)',
  1,
  '절약고수'
);

-- 두 번째 요청의 댓글 (depth 0, 1, 2 모두 포함)
DO $$
DECLARE
  v_post_id     uuid;
  v_comment1_id uuid;
  v_comment2_id uuid;
BEGIN
  SELECT id INTO v_post_id
  FROM vc_request_posts
  WHERE title = '영어 단어 플래시카드 앱 요청합니다'
  LIMIT 1;

  INSERT INTO vc_request_comments (post_id, content, depth, author_nickname)
  VALUES (v_post_id, '저도 스펙 비슷하게 생각했는데 Anki보다 간단한 버전으로 만들면 좋겠어요.', 0, '앱개발자지망생')
  RETURNING id INTO v_comment1_id;

  INSERT INTO vc_request_comments (post_id, parent_id, content, depth, author_nickname)
  VALUES (v_post_id, v_comment1_id, 'Anki는 기능이 너무 많아서 진입장벽이 높죠. 웹 기반으로 가볍게 만들면 좋을 것 같아요.', 1, '영어공부중')
  RETURNING id INTO v_comment2_id;

  INSERT INTO vc_request_comments (post_id, parent_id, content, depth, author_nickname)
  VALUES (v_post_id, v_comment2_id, '맞아요, PWA로 모바일에서도 쓸 수 있으면 완벽할 것 같아요!', 2, '모바일러');
END $$;


-- =============================================================================
-- 4. vc_info_cards — 정보 공유 카드 샘플 (4건)
-- =============================================================================

INSERT INTO vc_info_cards (
  id, title, summary, content_type, markdown_content,
  display_order, author_nickname, author_email, is_hidden
) VALUES

(
  gen_random_uuid(),
  'Claude Code로 첫 앱 만들기 — 완전 입문 가이드',
  'Claude Code를 처음 사용하는 분들을 위한 단계별 입문 가이드입니다. 설치부터 첫 배포까지!',
  'markdown',
  E'# Claude Code로 첫 앱 만들기\n\n## 1. Claude Code란?\nClaude Code는 Anthropic의 AI 코딩 어시스턴트입니다. 터미널에서 자연어로 명령을 내리면 코드를 작성하고 수정해 줍니다.\n\n## 2. 설치 방법\n```bash\nnpm install -g @anthropic-ai/claude-code\n```\n\n## 3. 프로젝트 시작하기\n1. 빈 폴더를 만드세요\n2. `claude` 명령어를 실행하세요\n3. "Next.js 앱을 만들어줘"라고 입력하세요\n\n## 4. 첫 배포 (Vercel)\n1. GitHub에 코드 푸시\n2. vercel.com에서 Import\n3. 자동 배포 완료!\n\n## 팁\n- 구체적으로 설명할수록 좋은 결과가 나옵니다\n- 에러가 나면 에러 메시지를 그대로 붙여넣으세요\n- 한 번에 큰 기능보다 작은 기능부터 추가하세요',
  10,
  '가이드작성자',
  'guide@example.com',
  false
),

(
  gen_random_uuid(),
  'Supabase 무료 플랜으로 DB 연동하기',
  'Supabase 무료 플랜을 활용해 바이브 코딩 앱에 데이터베이스를 연결하는 방법을 설명합니다.',
  'markdown',
  E'# Supabase 무료 플랜으로 DB 연동하기\n\n## Supabase란?\nSupabase는 오픈소스 Firebase 대안으로, PostgreSQL 기반의 백엔드 서비스입니다.\n\n## 무료 플랜 한도\n- DB 용량: 500MB\n- Row 수: 무제한\n- 월간 API 요청: 무제한 (Bandwidth 5GB)\n- 동시 접속: 최대 200개\n\n## 연동 순서\n\n### 1. 프로젝트 생성\n1. supabase.com 접속 → 로그인\n2. New Project 클릭\n3. 프로젝트명, DB 비밀번호 설정\n\n### 2. 테이블 만들기\n```sql\nCREATE TABLE todos (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  content text NOT NULL,\n  done boolean DEFAULT false,\n  created_at timestamptz DEFAULT now()\n);\n```\n\n### 3. Next.js에서 연결\n```typescript\nimport { createClient } from ''@supabase/supabase-js''\n\nconst supabase = createClient(\n  process.env.NEXT_PUBLIC_SUPABASE_URL!,\n  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!\n)\n```\n\n## 주의사항\n- anon key는 프론트에서 사용 가능하지만 RLS를 반드시 설정하세요\n- service_role key는 서버에서만 사용하세요',
  20,
  'DB초보탈출',
  NULL,
  false
),

(
  gen_random_uuid(),
  'v0로 UI 빠르게 만드는 꿀팁 모음',
  'Vercel v0를 사용해서 멋진 UI를 빠르게 생성하는 프롬프트 패턴과 꿀팁을 공유합니다.',
  'markdown',
  E'# v0로 UI 빠르게 만드는 꿀팁\n\n## v0란?\nVercel에서 만든 UI 생성 AI입니다. 프롬프트를 입력하면 shadcn/ui 기반의 React 컴포넌트를 즉시 생성해줍니다.\n\n## 잘 되는 프롬프트 패턴\n\n### 패턴 1: 구체적인 컴포넌트 명시\n```\n"다크모드를 지원하는 대시보드 사이드바를 만들어줘.\n메뉴: 홈, 분석, 설정. 현재 선택된 메뉴는 강조 표시."\n```\n\n### 패턴 2: 유사 서비스 참고\n```\n"Notion 스타일의 문서 카드 목록 컴포넌트.\n카드마다 아이콘, 제목, 수정일, 태그 뱃지 포함."\n```\n\n### 패턴 3: 기능 명세 포함\n```\n"상품 목록 카드 그리드.\n- 이미지 (16:9)\n- 상품명 (최대 2줄)\n- 가격 (빨간 할인가)\n- 찜하기 버튼 (하트 아이콘)\n- hover 시 그림자 효과"\n```\n\n## 팁\n- 생성 후 Chat 기능으로 수정 요청 가능\n- "더 모던하게", "간결하게" 등 스타일 지시 유효\n- Code 탭에서 직접 복사해서 Next.js에 붙여넣기',
  30,
  'UI마법사',
  NULL,
  false
),

(
  gen_random_uuid(),
  '바이브 코딩 도구 비교: 2025년 기준',
  'Claude Code, Cursor, Windsurf, v0, Bolt를 실제 사용해보고 비교한 주관적 리뷰입니다.',
  'markdown',
  E'# 바이브 코딩 도구 비교 (2025)\n\n> 개인적인 경험을 바탕으로 작성된 주관적 리뷰입니다.\n\n## 도구별 특징\n\n| 도구 | 강점 | 약점 | 추천 대상 |\n|------|------|------|-----------|\n| Claude Code | 복잡한 로직, 리팩토링 | 초기 설치 필요 | 개발 경험 있는 분 |\n| Cursor | IDE 통합, 컨텍스트 파악 | 유료 | 코드를 직접 보며 작업하는 분 |\n| Windsurf | 프로젝트 전체 파악 | 한국어 지원 미흡 | 대규모 프로젝트 |\n| v0 | UI 빠른 생성 | 백엔드 로직 약함 | UI 먼저 만들고 싶은 분 |\n| Bolt | 풀스택 빠른 프로토타입 | 세밀한 수정 한계 | MVP 빠르게 만들 때 |\n\n## 추천 조합\n\n### 입문자\n**Bolt** → 전체 앱 뼈대 → **v0** → 특정 UI 다듬기\n\n### 중급자\n**v0** → UI → **Claude Code** → 로직 및 API 연동\n\n### 프로젝트 규모별\n- 작은 앱 (1~2일): Bolt 또는 v0\n- 중간 앱 (1~2주): Cursor + Claude Code\n- 큰 앱 (1개월+): Windsurf + Claude Code',
  40,
  '도구탐험가',
  'tools@example.com',
  false
);


-- =============================================================================
-- 5. vc_links — 참고 링크 샘플 (5건)
-- =============================================================================

INSERT INTO vc_links (
  title, description, url, category,
  icon_url, display_order, author_nickname, is_hidden
) VALUES

(
  'Claude Code 공식 문서',
  'Anthropic의 Claude Code CLI 공식 문서. 설치, 명령어, 고급 사용법 안내.',
  'https://docs.anthropic.com/claude/docs/claude-code',
  'document',
  'https://www.anthropic.com/favicon.ico',
  10,
  '관리자',
  false
),

(
  'Bolt.new — AI 풀스택 빌더',
  '프롬프트만으로 풀스택 앱을 빠르게 만들 수 있는 AI 빌더. Vite/Next.js 프로젝트 즉시 생성.',
  'https://bolt.new',
  'tool',
  'https://bolt.new/favicon.ico',
  20,
  '관리자',
  false
),

(
  'v0 by Vercel',
  'Vercel의 UI 생성 AI. shadcn/ui 기반 컴포넌트를 프롬프트로 즉시 생성. Next.js 프로젝트에 바로 붙여넣기 가능.',
  'https://v0.dev',
  'tool',
  'https://v0.dev/favicon.ico',
  30,
  '관리자',
  false
),

(
  'Supabase 공식 문서',
  'PostgreSQL 기반 오픈소스 백엔드. Auth, DB, Storage, Realtime 통합 제공. 무료 플랜으로 시작 가능.',
  'https://supabase.com/docs',
  'document',
  'https://supabase.com/favicon.ico',
  40,
  '관리자',
  false
),

(
  '바이브 코딩 입문 유튜브 강의',
  'AI 도구를 활용해 비개발자가 앱을 만드는 과정을 처음부터 설명하는 한국어 강의 시리즈.',
  'https://www.youtube.com/@vibecoding-kr',
  'video',
  NULL,
  50,
  '강의추천러',
  false
);


-- =============================================================================
-- 6. vc_admin_settings — 관리자 설정 초기값 (중복 삽입 안전)
-- =============================================================================

INSERT INTO vc_admin_settings (key, value, label) VALUES
  ('ai_refine_enabled', 'true',  'AI 글 다듬기 (앱 등록 폼)')
ON CONFLICT (key) DO NOTHING;


-- =============================================================================
-- END OF SEED DATA
-- =============================================================================
