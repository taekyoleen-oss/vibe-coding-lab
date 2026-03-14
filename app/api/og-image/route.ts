import { NextRequest, NextResponse } from 'next/server'
import { fetchOgImage } from '@/lib/utils/og-fetch'

// GET /api/og-image?url=https://...
// 앱 URL에서 og:image를 추출해 반환 (폼 미리보기용)
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'url 파라미터가 필요합니다' }, { status: 400 })
  }

  try {
    new URL(url) // URL 형식 검증
  } catch {
    return NextResponse.json({ error: '잘못된 URL 형식입니다' }, { status: 400 })
  }

  const imageUrl = await fetchOgImage(url)
  return NextResponse.json({ imageUrl: imageUrl ?? null })
}
