import { createSupabaseServiceClient } from '@/lib/supabase/server'
import type {
  AppSearchParams,
  CreateAppInput,
  UpdateAppInput,
  SafeVcApp,
  PaginatedResponse,
} from '@/output/step2_types'

const PAGE_SIZE = 12

// Columns to SELECT — author_email is intentionally excluded
const SAFE_COLUMNS = [
  'id',
  'title',
  'description',
  'level',
  'screenshot_url',
  'app_url',
  'uses_api_key',
  'initial_prompt',
  'markdown_content',
  'vibe_tool',
  'author_nickname',
  'author_id',
  'is_hidden',
  'created_at',
  'updated_at',
].join(', ')

/**
 * Returns a paginated list of visible apps with optional FTS + filter.
 * Uses anon-compatible query (no service_role needed for SELECT).
 */
export async function getApps(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  params: AppSearchParams
): Promise<PaginatedResponse<SafeVcApp>> {
  const { q, level, uses_api_key, tool, page = 1 } = params
  const from = (page - 1) * PAGE_SIZE
  const to = page * PAGE_SIZE - 1

  let query = supabase
    .from('vc_apps')
    .select(SAFE_COLUMNS, { count: 'exact' })
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (level) query = query.eq('level', level)
  if (uses_api_key === false) query = query.eq('uses_api_key', false)
  if (tool && tool !== '전체') query = query.eq('vibe_tool', tool)

  if (q) {
    // Try FTS first
    const ftsQuery = query.textSearch('search_vector', q, {
      type: 'websearch',
      config: 'simple',
    })
    const { data: ftsData, count: ftsCount, error: ftsError } = await ftsQuery

    if (!ftsError && ftsData && ftsData.length > 0) {
      return { data: ftsData as SafeVcApp[], total: ftsCount ?? 0, page, pageSize: PAGE_SIZE }
    }

    // Fallback to ilike
    let fallback = supabase
      .from('vc_apps')
      .select(SAFE_COLUMNS, { count: 'exact' })
      .eq('is_hidden', false)
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (level) fallback = fallback.eq('level', level)
    if (uses_api_key === false) fallback = fallback.eq('uses_api_key', false)
    if (tool && tool !== '전체') fallback = fallback.eq('vibe_tool', tool)

    const { data, count, error } = await fallback
    if (error) throw new Error(error.message)
    return { data: (data ?? []) as SafeVcApp[], total: count ?? 0, page, pageSize: PAGE_SIZE }
  }

  const { data, count, error } = await query
  if (error) throw new Error(error.message)
  return { data: (data ?? []) as SafeVcApp[], total: count ?? 0, page, pageSize: PAGE_SIZE }
}

/**
 * Returns a single app by ID (author_email excluded).
 */
export async function getApp(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  id: string
): Promise<SafeVcApp | null> {
  const { data, error } = await supabase
    .from('vc_apps')
    .select(SAFE_COLUMNS)
    .eq('id', id)
    .eq('is_hidden', false)
    .single()

  if (error) return null
  return data as SafeVcApp
}

/**
 * Inserts a new app using the anon client.
 * Returns the new row's id.
 */
export async function createApp(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  input: CreateAppInput
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('vc_apps')
    .insert({
      title: input.title,
      description: input.description,
      level: input.level ?? null,
      screenshot_url: input.screenshot_url ?? null,
      app_url: input.app_url,
      uses_api_key: input.uses_api_key,
      initial_prompt: input.initial_prompt ?? null,
      markdown_content: input.markdown_content ?? null,
      vibe_tool: input.vibe_tool ?? null,
      author_nickname: input.author_nickname,
      author_email: input.author_email ?? null,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return data as { id: string }
}

/**
 * Updates an app. Requires service_role client.
 */
export async function updateApp(id: string, input: UpdateAppInput): Promise<void> {
  const serviceClient = createSupabaseServiceClient()
  const { error } = await serviceClient
    .from('vc_apps')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

/**
 * Soft-deletes an app by setting is_hidden = true. Requires service_role client.
 */
export async function softDeleteApp(id: string): Promise<void> {
  const serviceClient = createSupabaseServiceClient()
  const { error } = await serviceClient
    .from('vc_apps')
    .update({ is_hidden: true, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}
