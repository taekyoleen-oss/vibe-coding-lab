import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function createRatelimit(requests: number, window: string, prefix: string): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
    return null
  }
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
  })
  return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(requests, window as `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}`), prefix })
}

export const generalLimit = createRatelimit(10, '1 m', 'rl:general')
export const aiLimit = createRatelimit(3, '1 m', 'rl:ai')
export const contactLimit = createRatelimit(2, '1 m', 'rl:contact')

/**
 * Check rate limit for the given IP.
 * Throws an Error with message 'RATE_LIMIT' when the limit is exceeded.
 * If Redis is not configured, skips rate limiting (dev mode).
 */
export async function checkRateLimit(limit: Ratelimit | null, ip: string): Promise<void> {
  if (!limit) return // Redis not configured — skip in dev
  const { success } = await limit.limit(ip)
  if (!success) throw new Error('RATE_LIMIT')
}

/**
 * Extract IP address from a Request object.
 * Falls back to '127.0.0.1' when no IP header is present.
 */
export function getIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}
