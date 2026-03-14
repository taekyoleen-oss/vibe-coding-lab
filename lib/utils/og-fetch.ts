import { lookup } from 'dns/promises'

// SSRF 방어: private IP 범위
const PRIVATE_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /^0\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
]

async function isPrivateHost(hostname: string): Promise<boolean> {
  try {
    const result = await lookup(hostname, { all: true })
    for (const { address } of result) {
      if (PRIVATE_RANGES.some((r) => r.test(address))) return true
    }
    return false
  } catch {
    return true // resolve 실패 → 차단
  }
}

/**
 * 앱 URL에서 og:image 메타태그를 추출합니다.
 * SSRF 방어: private IP 차단, https만 허용, 5초 타임아웃
 */
export async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const parsed = new URL(url)

    if (parsed.protocol !== 'https:') return null

    if (await isPrivateHost(parsed.hostname)) return null

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VibeCodeBot/1.0; +https://vibelab.dev)',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(5000),
      redirect: 'follow',
    })

    if (!res.ok) return null

    // 전체 HTML 파싱 대신 앞부분(16KB)만 읽음 — og:image는 <head>에 있음
    const text = await res.text()
    const head = text.slice(0, 16384)

    // og:image 추출 (속성 순서 무관)
    const patterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    ]

    for (const pattern of patterns) {
      const match = head.match(pattern)
      if (match?.[1]) {
        const imgUrl = match[1].trim()
        if (!imgUrl) continue
        // 상대경로 → 절대경로 변환
        const abs = imgUrl.startsWith('http') ? imgUrl : new URL(imgUrl, url).href
        // 결과 URL도 https인지 확인
        if (abs.startsWith('https://')) return abs
        return null
      }
    }

    return null
  } catch {
    return null
  }
}
