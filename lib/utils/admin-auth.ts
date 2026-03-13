import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Verifies that the current session belongs to the admin user.
 * Uses ADMIN_USER_ID env var to compare against the authenticated user's id.
 */
export async function verifyAdminSession(): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false
    return user.id === process.env.ADMIN_USER_ID
  } catch {
    return false
  }
}
