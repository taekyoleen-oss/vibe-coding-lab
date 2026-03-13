import { NextRequest, NextResponse } from 'next/server'

// GET /api/links/meta?url=https://...
// Fetches Open Graph / basic metadata from a URL (SSRF-safe)
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'url 파라미터가 필요합니다' }, { status: 400 })

  // SSRF 방어: https only, private IP 차단
  if (!/^https:\/\/.+/.test(url)) {
    return NextResponse.json({ error: 'https:// URL만 허용됩니다' }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({ error: '올바르지 않은 URL입니다' }, { status: 400 })
  }

  // Private / loopback IP 차단
  const hostname = parsed.hostname
  const privatePatterns = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^0\./,
    /^::1$/,
    /^fd[0-9a-f]{2}:/i,
  ]
  if (privatePatterns.some((p) => p.test(hostname))) {
    return NextResponse.json({ error: '허용되지 않는 URL입니다' }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VibeCodingBot/1.0)' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return NextResponse.json({})

    const html = await res.text()

    const getTag = (property: string) => {
      const m =
        html.match(new RegExp(`<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']+)["']`, 'i')) ??
        html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${property}["']`, 'i'))
      return m?.[1] ?? null
    }

    const title =
      getTag('title') ??
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ??
      null

    const description =
      getTag('description') ??
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
      null

    const icon_url =
      getTag('image') ??
      `https://${hostname}/favicon.ico`

    return NextResponse.json({ title, description, icon_url })
  } catch {
    return NextResponse.json({})
  }
}
