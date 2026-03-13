import { createSupabaseServiceClient } from '@/lib/supabase/server'
import type {
  CreateCommentInput,
  SafeVcRequestComment,
  CommentNode,
} from '@/output/step2_types'

// Columns to SELECT — author_email is intentionally excluded
const SAFE_COLUMNS = [
  'id',
  'post_id',
  'parent_id',
  'content',
  'depth',
  'author_nickname',
  'author_id',
  'is_hidden',
  'created_at',
].join(', ')

/**
 * Returns all visible comments for a post as a nested tree (max depth 2).
 */
export async function getComments(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  postId: string
): Promise<CommentNode[]> {
  const { data, error } = await supabase
    .from('vc_request_comments')
    .select(SAFE_COLUMNS)
    .eq('post_id', postId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return buildCommentTree((data ?? []) as SafeVcRequestComment[])
}

/**
 * Converts a flat comment list into a nested tree structure.
 */
function buildCommentTree(comments: SafeVcRequestComment[]): CommentNode[] {
  const map = new Map<string, CommentNode>()
  for (const c of comments) {
    map.set(c.id, { ...c, children: [] })
  }

  const roots: CommentNode[] = []
  for (const c of comments) {
    const node = map.get(c.id)!
    if (c.parent_id) {
      const parent = map.get(c.parent_id)
      if (parent) parent.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

/**
 * Inserts a new comment using the anon client.
 * Validates depth (max 2) before insertion.
 */
export async function createComment(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  input: CreateCommentInput
): Promise<SafeVcRequestComment> {
  let depth = 0

  if (input.parent_id) {
    const { data: parent, error: parentError } = await supabase
      .from('vc_request_comments')
      .select('depth')
      .eq('id', input.parent_id)
      .single()

    if (parentError || !parent) throw new Error('Parent comment not found')
    depth = (parent.depth ?? 0) + 1
    if (depth > 2) throw new Error('MAX_DEPTH')
  }

  const { data, error } = await supabase
    .from('vc_request_comments')
    .insert({
      post_id: input.post_id,
      parent_id: input.parent_id ?? null,
      content: input.content,
      depth,
      author_nickname: input.author_nickname,
      author_email: input.author_email ?? null,
    })
    .select(SAFE_COLUMNS)
    .single()

  if (error) throw new Error(error.message)
  return data as SafeVcRequestComment
}

/**
 * Soft-deletes a comment by setting is_hidden = true. Requires service_role client.
 */
export async function softDeleteComment(id: string): Promise<void> {
  const serviceClient = createSupabaseServiceClient()
  const { error } = await serviceClient
    .from('vc_request_comments')
    .update({ is_hidden: true })
    .eq('id', id)

  if (error) throw new Error(error.message)
}
