import { createSupabaseServiceClient } from '@/lib/supabase/server'
import type { CreateLinkInput, UpdateLinkInput, VcLink } from '@/output/step2_types'

// vc_links has no author_email column, so all columns are safe
const SAFE_COLUMNS = [
  'id',
  'title',
  'description',
  'url',
  'category',
  'icon_url',
  'display_order',
  'author_nickname',
  'author_id',
  'is_hidden',
  'created_at',
  'updated_at',
].join(', ')

/**
 * Returns all visible links ordered by display_order asc, created_at desc.
 */
export async function getLinks(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<VcLink[]> {
  const { data, error } = await supabase
    .from('vc_links')
    .select(SAFE_COLUMNS)
    .eq('is_hidden', false)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as VcLink[]
}

/**
 * Inserts a new link using the anon client.
 */
export async function createLink(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  input: CreateLinkInput
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('vc_links')
    .insert({
      title: input.title,
      description: input.description ?? null,
      url: input.url,
      category: input.category ?? 'other',
      icon_url: input.icon_url ?? null,
      display_order: input.display_order ?? 0,
      author_nickname: input.author_nickname,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return data as { id: string }
}

/**
 * Updates a link. Requires service_role client.
 */
export async function updateLink(id: string, input: UpdateLinkInput): Promise<void> {
  const serviceClient = createSupabaseServiceClient()
  const { error } = await serviceClient
    .from('vc_links')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

/**
 * Soft-deletes a link. Requires service_role client.
 */
export async function softDeleteLink(id: string): Promise<void> {
  const serviceClient = createSupabaseServiceClient()
  const { error } = await serviceClient
    .from('vc_links')
    .update({ is_hidden: true, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}
