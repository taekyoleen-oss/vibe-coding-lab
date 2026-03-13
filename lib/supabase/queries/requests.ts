import { createSupabaseServiceClient } from '@/lib/supabase/server'
import type {
  RequestSearchParams,
  CreateRequestInput,
  UpdateRequestInput,
  SafeVcRequestPost,
  PaginatedResponse,
} from '@/output/step2_types'

const PAGE_SIZE = 12

// Columns to SELECT — author_email is intentionally excluded
const SAFE_COLUMNS = [
  'id',
  'title',
  'content',
  'request_type',
  'linked_app_id',
  'status',
  'view_count',
  'author_nickname',
  'author_id',
  'is_hidden',
  'created_at',
  'updated_at',
].join(', ')

/**
 * Returns a paginated list of visible request posts.
 */
export async function getRequests(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  params: RequestSearchParams
): Promise<PaginatedResponse<SafeVcRequestPost>> {
  const { q, status, request_type, linked_app_id, page = 1 } = params
  const from = (page - 1) * PAGE_SIZE
  const to = page * PAGE_SIZE - 1

  let query = supabase
    .from('vc_request_posts')
    .select(SAFE_COLUMNS, { count: 'exact' })
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status) query = query.eq('status', status)
  if (request_type) query = query.eq('request_type', request_type)
  if (linked_app_id) query = query.eq('linked_app_id', linked_app_id)

  if (q) {
    const ftsResult = await query.textSearch('search_vector', q, {
      type: 'websearch',
      config: 'simple',
    })
    if (!ftsResult.error && ftsResult.data?.length) {
      return {
        data: ftsResult.data as SafeVcRequestPost[],
        total: ftsResult.count ?? 0,
        page,
        pageSize: PAGE_SIZE,
      }
    }

    // Fallback to ilike on title
    let fallback = supabase
      .from('vc_request_posts')
      .select(SAFE_COLUMNS, { count: 'exact' })
      .eq('is_hidden', false)
      .ilike('title', `%${q}%`)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (status) fallback = fallback.eq('status', status)
    if (request_type) fallback = fallback.eq('request_type', request_type)
    if (linked_app_id) fallback = fallback.eq('linked_app_id', linked_app_id)

    const { data, count, error } = await fallback
    if (error) throw new Error(error.message)
    return { data: (data ?? []) as SafeVcRequestPost[], total: count ?? 0, page, pageSize: PAGE_SIZE }
  }

  const { data, count, error } = await query
  if (error) throw new Error(error.message)
  return { data: (data ?? []) as SafeVcRequestPost[], total: count ?? 0, page, pageSize: PAGE_SIZE }
}

/**
 * Returns a single request post by ID (author_email excluded).
 */
export async function getRequest(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  id: string
): Promise<SafeVcRequestPost | null> {
  const { data, error } = await supabase
    .from('vc_request_posts')
    .select(SAFE_COLUMNS)
    .eq('id', id)
    .eq('is_hidden', false)
    .single()

  if (error) return null
  return data as SafeVcRequestPost
}

/**
 * Inserts a new request post using the anon client.
 */
export async function createRequest(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  input: CreateRequestInput
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('vc_request_posts')
    .insert({
      title: input.title,
      content: input.content,
      request_type: input.request_type ?? 'general',
      linked_app_id: input.linked_app_id ?? null,
      author_nickname: input.author_nickname,
      author_email: input.author_email ?? null,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return data as { id: string }
}

/**
 * Updates a request post. Requires service_role client.
 */
export async function updateRequest(id: string, input: UpdateRequestInput): Promise<void> {
  const serviceClient = createSupabaseServiceClient()
  const { error } = await serviceClient
    .from('vc_request_posts')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

/**
 * Soft-deletes a request post. Requires service_role client.
 */
export async function softDeleteRequest(id: string): Promise<void> {
  const serviceClient = createSupabaseServiceClient()
  const { error } = await serviceClient
    .from('vc_request_posts')
    .update({ is_hidden: true, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

/**
 * Increments view_count for a request post. Requires service_role client.
 */
export async function incrementViewCount(id: string): Promise<void> {
  const serviceClient = createSupabaseServiceClient()
  const { error } = await serviceClient.rpc('increment_view_count', { post_id: id })

  if (error) {
    // Fallback: manual increment if RPC not available
    const { data: current } = await serviceClient
      .from('vc_request_posts')
      .select('view_count')
      .eq('id', id)
      .single()

    if (current) {
      await serviceClient
        .from('vc_request_posts')
        .update({ view_count: (current.view_count ?? 0) + 1 })
        .eq('id', id)
    }
  }
}
