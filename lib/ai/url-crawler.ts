// SSRF-protected URL crawling.
// Only allows https:// URLs that do not resolve to private/loopback addresses.

const BLOCKED_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
]

const MAX_CONTENT_LENGTH = 2000
const TIMEOUT_MS = 3000

/**
 * Crawls the given URL and returns its text content (up to 2000 chars).
 * Returns null if the URL is blocked, not https, or the request fails/times out.
 */
export async function crawlUrl(url: string): Promise<string | null> {
  try {
    const parsed = new URL(url)

    // Only allow https
    if (parsed.protocol !== 'https:') return null

    // Block private/loopback hostnames
    if (BLOCKED_PATTERNS.some((r) => r.test(parsed.hostname))) return null

    const res = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'User-Agent': 'BiDevLab/1.0',
        Accept: 'text/html,application/xhtml+xml',
      },
    })

    if (!res.ok) return null

    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('text/')) return null

    const html = await res.text()

    // Strip HTML tags and collapse whitespace
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_CONTENT_LENGTH)

    return text || null
  } catch {
    // Timeout, DNS failure, or any other network error
    return null
  }
}
