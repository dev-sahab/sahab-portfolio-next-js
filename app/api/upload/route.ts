import { NextRequest, NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { v2 as cloudinary } from 'cloudinary'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import { slugify } from '@/lib/utils'
import { checkMediaUsage } from '@/lib/mediaUsage'
import { apiError } from '@/lib/apiError'

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
})

function extractPublicId(url: string): string | null {
  try {
    const { hostname, pathname } = new URL(url)
    if (!hostname.includes('cloudinary.com')) return null
    const parts = pathname.split('/').filter(Boolean)
    const uploadIdx = parts.indexOf('upload')
    if (uploadIdx === -1) return null
    let rest = parts.slice(uploadIdx + 1)
    if (rest[0] && /^v\d+$/.test(rest[0])) rest = rest.slice(1)
    if (!rest.length) return null
    return rest.join('/').replace(/\.[a-zA-Z0-9]+$/, '')
  } catch {
    return null
  }
}

function buildPublicId(originalName: string): string {
  const base = slugify(originalName.replace(/\.[^/.]+$/, '')) || 'image'
  const suffix = Math.random().toString(36).slice(2, 8)
  return `${base}-${suffix}`
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (!can(role, 'media.write')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

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
      public_id: buildPublicId(file.name),
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    })

    await connectDB()
    const userId = (session.user as any)?.id
    const media = await Media.create({
      url: result.secure_url,
      publicId: result.public_id,
      filename: file.name,
      title: file.name.replace(/\.[^/.]+$/, ''),
      mimeType: file.type,
      width: result.width,
      height: result.height,
      size: file.size,
      folder,
      uploadedBy: Types.ObjectId.isValid(userId) ? userId : undefined,
    })

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        mediaId: media._id.toString(),
      },
    })
  } catch (e: any) {
    return apiError(e, 'upload')
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (!can(role, 'media.write')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  try {
    const { url: bodyUrl, publicId: bodyPublicId } = await req.json()
    await connectDB()

    let publicId = bodyPublicId as string | null
    let url = bodyUrl as string | undefined
    if (!publicId && url) publicId = extractPublicId(url)
    if (!url && publicId) {
      const doc = await Media.findOne({ publicId }).lean()
      url = (doc as any)?.url
    }
    if (!publicId) return NextResponse.json({ success: false, error: 'Could not resolve Cloudinary public id' }, { status: 400 })

    if (url) {
      const usage = await checkMediaUsage(url)
      if (usage.inUse) {
        return NextResponse.json({
          success: false,
          error: 'Image is in use elsewhere and was not deleted.',
          usage,
        }, { status: 409 })
      }
    }

    await cloudinary.uploader.destroy(publicId)
    await Media.deleteOne({ publicId })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return apiError(e, 'upload')
  }
}
