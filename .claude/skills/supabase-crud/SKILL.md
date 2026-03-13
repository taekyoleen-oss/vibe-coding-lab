# supabase-crud 스킬

## 용도
Supabase 클라이언트 설정, 쿼리 패턴, RLS 정책 작성 가이드

---

## 클라이언트 설정

### 브라우저용 (Client Component)
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 서버용 (Server Component / Route Handler)
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createSupabaseServerClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set({ name, value, ...options }),
        remove: (name, options) => cookieStore.set({ name, value: '', ...options }),
      }
    }
  )
}

// 관리자 전용 (service_role)
export function createSupabaseServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: () => undefined, set: () => {}, remove: () => {} } }
  )
}
```

---

## 쿼리 패턴

### 앱 목록 조회 (FTS + 필터 + 페이지네이션)
```typescript
// lib/supabase/queries/apps.ts
export async function getApps(params: AppSearchParams) {
  const { q, level, uses_api_key, tool, page = 1 } = params
  const PAGE_SIZE = 12

  let query = supabase
    .from('vc_apps')
    .select('*, count:id.count()', { count: 'exact' })
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (level) query = query.eq('level', level)
  if (uses_api_key === false) query = query.eq('uses_api_key', false)
  if (tool && tool !== '전체') query = query.eq('vibe_tool', tool)

  if (q) {
    // FTS 우선
    const { data, count } = await query.textSearch('search_vector', q, { type: 'websearch', config: 'simple' })
    if (data?.length) return { data, total: count ?? 0 }

    // FTS 결과 없으면 ilike 폴백
    return supabase.from('vc_apps').select('*').eq('is_hidden', false)
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .eq('level', level ?? '')
  }

  return query
}
```

### 단건 조회 (author_email 제외)
```typescript
const { data } = await supabase
  .from('vc_apps')
  .select('id, title, description, level, screenshot_url, app_url, uses_api_key, initial_prompt, markdown_content, vibe_tool, author_nickname, author_id, is_hidden, created_at, updated_at')
  .eq('id', id)
  .single()
// ⚠️ author_email은 절대 SELECT에 포함하지 말 것
```

### INSERT (anon key, Rate Limit은 서버 사이드 처리)
```typescript
const { data, error } = await supabase
  .from('vc_apps')
  .insert({
    title, description, level, app_url, uses_api_key,
    initial_prompt, markdown_content, vibe_tool,
    author_nickname, author_email,  // DB에는 저장, 응답에서 제외
    screenshot_url,
  })
  .select('id')
  .single()
```

### UPDATE (service_role만)
```typescript
const serviceClient = createSupabaseServiceClient()
await serviceClient.from('vc_apps').update({ title, description }).eq('id', id)
```

### 소프트 삭제 (is_hidden)
```typescript
// 하드 DELETE 대신 항상 is_hidden = true
await serviceClient.from('vc_apps').update({ is_hidden: true }).eq('id', id)
```

### 댓글 스레드 조회 (depth ≤ 2)
```typescript
const { data: comments } = await supabase
  .from('vc_request_comments')
  .select('*')
  .eq('post_id', postId)
  .eq('is_hidden', false)
  .order('created_at', { ascending: true })

// 클라이언트에서 트리 구조로 변환
function buildTree(comments: VcRequestComment[]) {
  const map = new Map(comments.map(c => [c.id, { ...c, children: [] }]))
  const roots: any[] = []
  for (const c of comments) {
    if (c.parent_id) map.get(c.parent_id)?.children.push(map.get(c.id))
    else roots.push(map.get(c.id))
  }
  return roots
}
```

### vc_admin_settings 조회/업데이트
```typescript
// lib/supabase/queries/settings.ts

// 특정 키 조회 (anon 허용)
export async function getSetting(key: string): Promise<string | null> {
  const { data } = await supabase.from('vc_admin_settings').select('value').eq('key', key).single()
  return data?.value ?? null
}

// 업데이트 (service_role)
export async function updateSetting(key: string, value: string) {
  await serviceClient.from('vc_admin_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() })
}
```

### view_count 증가 (클라이언트 사이드, 1회만)
```typescript
// useEffect에서 1회 호출
useEffect(() => {
  fetch(`/api/requests/${id}/view`, { method: 'POST' })
}, [id])

// Route Handler
await serviceClient.rpc('increment_view_count', { post_id: id })
// 또는
await serviceClient.from('vc_request_posts').update({ view_count: supabase.sql`view_count + 1` }).eq('id', id)
```

---

## 에러 처리 패턴

```typescript
const { data, error } = await supabase.from('vc_apps').select('*')
if (error) {
  console.error('[Supabase Error]', error.message, error.code)
  return NextResponse.json({ error: '일시적으로 불러올 수 없습니다' }, { status: 500 })
}
```

---

## 주의사항

1. `author_email`은 SELECT 쿼리에 절대 포함 금지 — API 응답에서 노출되면 안 됨
2. UPDATE/DELETE는 항상 `service_role` 클라이언트 사용
3. INSERT는 `anon` key 사용 가능 (RLS에서 허용됨)
4. `is_hidden = false` 필터를 SELECT 쿼리에 항상 포함
5. 페이지네이션: `range((page-1)*12, page*12-1)`
