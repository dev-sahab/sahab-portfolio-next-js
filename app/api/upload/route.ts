import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file   = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'sahab-portfolio'

    if (!file) return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })

    const allowed = ['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
    if (!allowed.includes(file.type)) return NextResponse.json({ success: false, error: 'Invalid type. Use JPG, PNG, WebP, GIF or SVG.' }, { status: 400 })
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ success: false, error: 'Max 10 MB per image.' }, { status: 400 })

    const bytes  = await file.arrayBuffer()
    const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`

    const result = await cloudinary.uploader.upload(base64, {
      folder,
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    })

    return NextResponse.json({ success: true, data: { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
