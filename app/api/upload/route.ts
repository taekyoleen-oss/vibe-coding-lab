import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { generalLimit, checkRateLimit, getIp } from '@/lib/utils/rate-limit'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// POST /api/upload — uploads an image to Supabase Storage
// Query param: bucket=app-screenshots|info-slides (defaults to app-screenshots)
export async function POST(req: NextRequest) {
  try {
    await checkRateLimit(generalLimit, getIp(req))
  } catch {
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 })
  }

  try {
    const bucket = req.nextUrl.searchParams.get('bucket') ?? 'app-screenshots'
    if (!['app-screenshots', 'info-slides'].includes(bucket)) {
      return NextResponse.json({ error: '유효하지 않은 버킷입니다' }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: '파일 크기는 5MB 이하여야 합니다' }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '이미지 파일만 업로드 가능합니다 (JPEG, PNG, WebP, GIF)' },
        { status: 400 }
      )
    }

    const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const arrayBuffer = await file.arrayBuffer()

    const serviceClient = createSupabaseServiceClient()
    const { data, error } = await serviceClient.storage
      .from(bucket)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('[POST /api/upload] Storage error:', error.message)
      return NextResponse.json({ error: '파일 업로드에 실패했습니다' }, { status: 500 })
    }

    const { data: urlData } = serviceClient.storage.from(bucket).getPublicUrl(data.path)

    return NextResponse.json({ url: urlData.publicUrl, path: data.path }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/upload]', err)
    return NextResponse.json({ error: '파일 업로드에 실패했습니다' }, { status: 500 })
  }
}
