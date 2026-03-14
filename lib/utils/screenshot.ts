import { createSupabaseServiceClient } from '@/lib/supabase/server'

/**
 * thum.io를 이용해 앱 URL의 실제 초기화면 스크린샷을 캡처하고
 * Supabase Storage에 업로드 후 public URL을 반환합니다.
 * 실패 시 null 반환, reason에 실패 단계 기록.
 */
export async function captureScreenshot(
  appUrl: string
): Promise<{ url: string; reason?: never } | { url: null; reason: string }> {
  try {
    if (!appUrl.startsWith('https://')) {
      return { url: null, reason: 'URL must start with https://' }
    }

    const captureUrl =
      `https://image.thum.io/get/width/1200/crop/630/noanimate/` +
      encodeURIComponent(appUrl)

    const res = await fetch(captureUrl, {
      signal: AbortSignal.timeout(20000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VibeCodeBot/1.0)' },
    })

    const contentType = res.headers.get('content-type') ?? ''
    if (!res.ok || !contentType.startsWith('image/')) {
      const reason = `thum.io 응답 실패: status=${res.status} content-type=${contentType}`
      console.error('[captureScreenshot]', reason)
      return { url: null, reason }
    }

    const buffer = await res.arrayBuffer()
    if (buffer.byteLength < 1000) {
      const reason = `이미지 크기 너무 작음: ${buffer.byteLength} bytes`
      console.error('[captureScreenshot]', reason)
      return { url: null, reason }
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`

    const service = createSupabaseServiceClient()
    const { error } = await service.storage
      .from('app-screenshots')
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      })

    if (error) {
      const reason = `Storage 업로드 실패: ${error.message}`
      console.error('[captureScreenshot]', reason)
      return { url: null, reason }
    }

    const { data: { publicUrl } } = service.storage
      .from('app-screenshots')
      .getPublicUrl(filename)

    return { url: publicUrl }
  } catch (err) {
    const reason = `예외 발생: ${err instanceof Error ? err.message : String(err)}`
    console.error('[captureScreenshot]', reason)
    return { url: null, reason }
  }
}
