import { createSupabaseServiceClient } from '@/lib/supabase/server'

/**
 * thum.io를 이용해 앱 URL의 실제 초기화면 스크린샷을 캡처하고
 * Supabase Storage에 업로드 후 public URL을 반환합니다.
 * 실패 시 null 반환.
 */
export async function captureScreenshot(appUrl: string): Promise<string | null> {
  try {
    if (!appUrl.startsWith('https://')) return null

    // thum.io: 무료 스크린샷 서비스 (API 키 불필요)
    const captureUrl =
      `https://image.thum.io/get/width/1200/crop/630/noanimate/` +
      encodeURIComponent(appUrl)

    const res = await fetch(captureUrl, {
      signal: AbortSignal.timeout(20000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VibeCodeBot/1.0)' },
    })

    if (!res.ok || !res.headers.get('content-type')?.startsWith('image/')) {
      console.error('[captureScreenshot] thum.io 응답 실패:', res.status, res.headers.get('content-type'))
      return null
    }

    const buffer = await res.arrayBuffer()
    if (buffer.byteLength < 1000) {
      console.error('[captureScreenshot] 이미지 크기 너무 작음:', buffer.byteLength, 'bytes')
      return null
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
      console.error('[captureScreenshot] Storage 업로드 실패:', error.message)
      return null
    }

    const { data: { publicUrl } } = service.storage
      .from('app-screenshots')
      .getPublicUrl(filename)

    return publicUrl
  } catch (err) {
    console.error('[captureScreenshot] 예외 발생:', err)
    return null
  }
}
