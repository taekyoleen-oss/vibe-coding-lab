import { randomUUID } from 'crypto'
import type { ContentType } from '@/output/step2_types'

/**
 * Creates a magic link token valid for 15 minutes.
 * Requires a service_role Supabase client (vc_magic_link_tokens blocks anon access).
 */
export async function createMagicLinkToken(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  email: string,
  contentType: ContentType,
  contentId: string
): Promise<string> {
  const token = randomUUID()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  const { error } = await supabase.from('vc_magic_link_tokens').insert({
    token,
    email,
    content_type: contentType,
    content_id: contentId,
    expires_at: expiresAt,
  })

  if (error) {
    console.error('[MagicLink] Insert error:', error.message)
    throw new Error('Failed to create magic link token')
  }

  return token
}

/**
 * Verifies a magic link token.
 * Returns the token row if valid (unused and not expired), or null otherwise.
 * Marks the token as used upon successful verification.
 */
export async function verifyMagicLinkToken(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  token: string
) {
  const { data, error } = await supabase
    .from('vc_magic_link_tokens')
    .select('*')
    .eq('token', token)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) return null

  // Mark as used to prevent replay attacks
  await supabase
    .from('vc_magic_link_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', data.id)

  return data as {
    id: string
    token: string
    email: string
    content_type: ContentType
    content_id: string
    expires_at: string
    used_at: string | null
  }
}
