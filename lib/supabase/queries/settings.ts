import { createSupabaseServiceClient } from '@/lib/supabase/server'
import type { VcAdminSettings } from '@/output/step2_types'

/**
 * Returns the value of a single admin setting by key.
 * Uses anon client — vc_admin_settings allows anon SELECT.
 */
export async function getSetting(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  key: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('vc_admin_settings')
    .select('value')
    .eq('key', key)
    .single()

  if (error || !data) return null
  return data.value as string
}

/**
 * Returns all admin settings.
 * Uses anon client — vc_admin_settings allows anon SELECT.
 */
export async function getAllSettings(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<VcAdminSettings[]> {
  const { data, error } = await supabase
    .from('vc_admin_settings')
    .select('key, value, label, updated_at')
    .order('key', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as VcAdminSettings[]
}

/**
 * Upserts a setting by key. Requires service_role client.
 */
export async function updateSetting(key: string, value: string): Promise<void> {
  const serviceClient = createSupabaseServiceClient()
  const { error } = await serviceClient.from('vc_admin_settings').upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
  })

  if (error) throw new Error(error.message)
}
