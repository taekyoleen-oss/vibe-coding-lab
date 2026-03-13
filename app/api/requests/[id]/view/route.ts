import { NextRequest, NextResponse } from 'next/server'
import { incrementViewCount } from '@/lib/supabase/queries/requests'

// POST /api/requests/[id]/view — increments view_count
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await incrementViewCount(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/requests/[id]/view]', err)
    // Non-critical — return 200 to avoid client-side noise
    return NextResponse.json({ success: false })
  }
}
