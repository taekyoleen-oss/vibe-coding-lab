import { createSupabaseServiceClient } from '@/lib/supabase/server'
import type {
  CreateInfoCardInput,
  UpdateInfoCardInput,
  SafeVcInfoCard,
  VcInfoCardWithSlides,
  VcInfoSlide,
} from '@/output/step2_types'

// Columns to SELECT — author_email is intentionally excluded
const SAFE_COLUMNS = [
  'id',
  'title',
  'summary',
  'content_type',
  'markdown_content',
  'display_order',
  'author_nickname',
  'author_id',
  'is_hidden',
  'created_at',
  'updated_at',
].join(', ')

/**
 * Returns all visible info cards ordered by display_order asc, created_at desc.
 */
export async function getInfoCards(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<SafeVcInfoCard[]> {
  const { data, error } = await supabase
    .from('vc_info_cards')
    .select(SAFE_COLUMNS)
    .eq('is_hidden', false)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as SafeVcInfoCard[]
}

/**
 * Returns a single info card with its slides.
 */
export async function getInfoCard(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  id: string
): Promise<VcInfoCardWithSlides | null> {
  const { data: card, error: cardError } = await supabase
    .from('vc_info_cards')
    .select(SAFE_COLUMNS)
    .eq('id', id)
    .eq('is_hidden', false)
    .single()

  if (cardError || !card) return null

  const { data: slides, error: slidesError } = await supabase
    .from('vc_info_slides')
    .select('id, card_id, slide_url, slide_order, alt_text')
    .eq('card_id', id)
    .order('slide_order', { ascending: true })

  if (slidesError) throw new Error(slidesError.message)

  return { ...(card as SafeVcInfoCard), slides: (slides ?? []) as VcInfoSlide[] }
}

/**
 * Inserts a new info card using the anon client.
 */
export async function createInfoCard(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  input: CreateInfoCardInput
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('vc_info_cards')
    .insert({
      title: input.title,
      summary: input.summary ?? null,
      content_type: input.content_type,
      markdown_content: input.markdown_content ?? null,
      display_order: input.display_order ?? 0,
      author_nickname: input.author_nickname,
      author_email: input.author_email ?? null,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return data as { id: string }
}

/**
 * Updates an info card. Requires service_role client.
 */
export async function updateInfoCard(id: string, input: UpdateInfoCardInput): Promise<void> {
  const serviceClient = createSupabaseServiceClient()
  const { error } = await serviceClient
    .from('vc_info_cards')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

/**
 * Soft-deletes an info card. Requires service_role client.
 */
export async function softDeleteInfoCard(id: string): Promise<void> {
  const serviceClient = createSupabaseServiceClient()
  const { error } = await serviceClient
    .from('vc_info_cards')
    .update({ is_hidden: true, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}
