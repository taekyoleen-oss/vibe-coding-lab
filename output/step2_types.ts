// =============================================================================
// 비개발자의 개발실 (Vibe Code Lab) — TypeScript Types
// Generated from: output/step1_schema.sql (v1.7)
// =============================================================================

// =============================================================================
// 1. Enum / Union Types
// =============================================================================

export type AppLevel = 'beginner' | 'intermediate' | 'advanced'

export type VibeTool =
  | 'Claude Code'
  | 'Cursor'
  | 'Windsurf'
  | 'v0'
  | 'Bolt'
  | 'Replit'
  | '기타'

export type LinkCategory = 'tool' | 'document' | 'community' | 'video' | 'other'

export type RequestType = 'general' | 'app_feedback' | 'app_error' | 'app_update'

export type RequestStatus = 'requested' | 'in_progress' | 'completed' | 'closed'

export type ContentType = 'app' | 'request' | 'info' | 'link'

export type InfoContentType = 'slides' | 'markdown'

// =============================================================================
// 2. DB Row Types (full — includes author_email for server-side use only)
// =============================================================================

export type VcApp = {
  id: string
  title: string
  description: string
  level: AppLevel | null
  screenshot_url: string | null
  app_url: string
  uses_api_key: boolean
  initial_prompt: string | null
  markdown_content: string | null
  vibe_tool: VibeTool | null
  author_nickname: string
  author_email: string | null   // SERVER-SIDE ONLY — never include in API responses
  author_id: string | null
  is_hidden: boolean
  created_at: string
  updated_at: string
  search_vector?: unknown        // tsvector — not used in application code
  embedding?: unknown            // vector(1536) — v2.0 reserved
}

export type VcRequestPost = {
  id: string
  title: string
  content: string
  request_type: RequestType
  linked_app_id: string | null
  status: RequestStatus
  view_count: number
  author_nickname: string
  author_email: string | null   // SERVER-SIDE ONLY — never include in API responses
  author_id: string | null
  is_hidden: boolean
  created_at: string
  updated_at: string
  search_vector?: unknown        // tsvector — not used in application code
}

export type VcRequestComment = {
  id: string
  post_id: string
  parent_id: string | null
  content: string
  depth: number
  author_nickname: string
  author_email: string | null   // SERVER-SIDE ONLY — never include in API responses
  author_id: string | null
  is_hidden: boolean
  created_at: string
}

export type VcInfoCard = {
  id: string
  title: string
  summary: string | null
  content_type: InfoContentType
  markdown_content: string | null
  display_order: number
  author_nickname: string
  author_email: string | null   // SERVER-SIDE ONLY — never include in API responses
  author_id: string | null
  is_hidden: boolean
  created_at: string
  updated_at: string
}

export type VcInfoSlide = {
  id: string
  card_id: string
  slide_url: string
  slide_order: number
  alt_text: string | null
}

export type VcLink = {
  id: string
  title: string
  description: string | null
  url: string
  category: LinkCategory
  icon_url: string | null
  display_order: number
  author_nickname: string
  author_id: string | null
  is_hidden: boolean
  created_at: string
  updated_at: string
}

export type VcAdminSettings = {
  key: string
  value: string
  label: string | null
  updated_at: string
}

export type VcMagicLinkToken = {
  id: string
  token: string
  email: string
  content_type: ContentType
  content_id: string
  expires_at: string
  used_at: string | null
}

// =============================================================================
// 3. Safe Public Types (author_email excluded)
// =============================================================================

export type SafeVcApp = Omit<VcApp, 'author_email' | 'search_vector' | 'embedding'>

export type SafeVcRequestPost = Omit<VcRequestPost, 'author_email' | 'search_vector'>

export type SafeVcRequestComment = Omit<VcRequestComment, 'author_email'>

export type SafeVcInfoCard = Omit<VcInfoCard, 'author_email'>

// Comment node with children (for tree rendering)
export type CommentNode = SafeVcRequestComment & {
  children: CommentNode[]
}

// Info card with slides attached
export type VcInfoCardWithSlides = SafeVcInfoCard & {
  slides: VcInfoSlide[]
}

// =============================================================================
// 4. API Request Types
// =============================================================================

// --- Apps ---
export type AppSearchParams = {
  q?: string
  level?: AppLevel
  uses_api_key?: boolean
  tool?: VibeTool | '전체'
  page?: number
}

export type CreateAppInput = {
  title: string
  description: string
  level?: AppLevel
  screenshot_url?: string
  app_url: string
  uses_api_key: boolean
  initial_prompt?: string
  markdown_content?: string
  vibe_tool?: VibeTool
  author_nickname: string
  author_email?: string
}

export type UpdateAppInput = Partial<
  Pick<
    VcApp,
    | 'title'
    | 'description'
    | 'level'
    | 'screenshot_url'
    | 'app_url'
    | 'uses_api_key'
    | 'initial_prompt'
    | 'markdown_content'
    | 'vibe_tool'
    | 'author_nickname'
    | 'is_hidden'
  >
>

// --- Requests ---
export type RequestSearchParams = {
  q?: string
  status?: RequestStatus
  request_type?: RequestType
  linked_app_id?: string
  page?: number
}

export type CreateRequestInput = {
  title: string
  content: string
  request_type?: RequestType
  linked_app_id?: string
  author_nickname: string
  author_email?: string
}

export type UpdateRequestInput = Partial<
  Pick<VcRequestPost, 'title' | 'content' | 'status' | 'request_type' | 'linked_app_id' | 'is_hidden'>
>

// --- Comments ---
export type CreateCommentInput = {
  post_id: string
  parent_id?: string
  content: string
  author_nickname: string
  author_email?: string
}

// --- Info Cards ---
export type CreateInfoCardInput = {
  title: string
  summary?: string
  content_type: InfoContentType
  markdown_content?: string
  display_order?: number
  author_nickname: string
  author_email?: string
}

export type UpdateInfoCardInput = Partial<
  Pick<VcInfoCard, 'title' | 'summary' | 'content_type' | 'markdown_content' | 'display_order' | 'is_hidden'>
>

// --- Links ---
export type CreateLinkInput = {
  title: string
  description?: string
  url: string
  category?: LinkCategory
  icon_url?: string
  display_order?: number
  author_nickname: string
}

export type UpdateLinkInput = Partial<
  Pick<VcLink, 'title' | 'description' | 'url' | 'category' | 'icon_url' | 'display_order' | 'is_hidden'>
>

// --- Admin Settings ---
export type UpdateSettingInput = {
  key: string
  value: string
}

// --- Magic Link ---
export type MagicLinkRequestInput = {
  email: string
  content_type: ContentType
  content_id: string
}

// --- AI ---
export type RefineAppInput = {
  title: string
  description: string
  initial_prompt?: string
  app_url?: string
}

export type RefineAppResponse = {
  title: string
  description: string
  initial_prompt?: string
}

// --- Contact ---
export type ContactInput = {
  name: string
  email: string
  subject: string
  message: string
}

// --- Upload ---
export type UploadResponse = {
  url: string
  path: string
}

// =============================================================================
// 5. API Response Types
// =============================================================================

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export type AppListResponse = PaginatedResponse<SafeVcApp>

export type RequestListResponse = PaginatedResponse<SafeVcRequestPost>

export type ApiError = {
  error: string
  code?: string
}

export type ApiSuccess<T = unknown> = {
  data: T
  message?: string
}
