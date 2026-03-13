import type { NextRequest, NextResponse } from 'next/server'
import type { ContentType } from '@/output/step2_types'

const COOKIE_NAME = 'owner_session'
const SESSION_TTL_MS = 30 * 60 * 1000 // 30 minutes

interface OwnerSessionPayload {
  contentType: ContentType
  contentId: string
  exp: number
}

/**
 * Sets an owner session cookie on the response.
 * The cookie expires in 30 minutes and is httpOnly + sameSite=lax.
 */
export function setOwnerSessionCookie(
  res: NextResponse,
  contentType: ContentType,
  contentId: string
): void {
  const payload: OwnerSessionPayload = {
    contentType,
    contentId,
    exp: Date.now() + SESSION_TTL_MS,
  }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64')
  res.cookies.set(COOKIE_NAME, encoded, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1800,
    path: '/',
  })
}

/**
 * Validates the owner session cookie from the request.
 * Returns true only when the cookie is present, not expired,
 * and matches the expected contentType and contentId.
 */
export function getOwnerSession(
  req: NextRequest,
  contentType: ContentType,
  contentId: string
): boolean {
  const cookie = req.cookies.get(COOKIE_NAME)?.value
  if (!cookie) return false
  try {
    const payload: OwnerSessionPayload = JSON.parse(
      Buffer.from(cookie, 'base64').toString('utf-8')
    )
    return (
      payload.contentType === contentType &&
      payload.contentId === contentId &&
      Date.now() < payload.exp
    )
  } catch {
    return false
  }
}
