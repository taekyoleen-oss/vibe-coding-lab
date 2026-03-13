import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSetting } from '@/lib/supabase/queries/settings'

// GET /api/ai/status — public, reads ai_refine_enabled from vc_admin_settings
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const value = await getSetting(supabase, 'ai_refine_enabled')
    const enabled = value === 'true'
    return NextResponse.json({ enabled })
  } catch (err) {
    console.error('[GET /api/ai/status]', err)
    // Default to disabled on error to prevent unexpected API usage
    return NextResponse.json({ enabled: false })
  }
}
