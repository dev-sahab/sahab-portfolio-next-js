import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import { checkMediaUsage } from '@/lib/mediaUsage'

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
})

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  try {
    await connectDB()
    const { id } = await params
    const item = await Media.findById(id).lean()
    if (!item) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: item })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const update: Record<string, any> = {}
    if (typeof body.title === 'string') update.title = body.title
    if (typeof body.altText === 'string') update.altText = body.altText
    if (typeof body.caption === 'string') update.caption = body.caption
    const item = await Media.findByIdAndUpdate(id, update, { new: true, runValidators: true })
    if (!item) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: item })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  try {
    await connectDB()
    const { id } = await params
    const item = await Media.findById(id)
    if (!item) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const usage = await checkMediaUsage(item.url)
    if (usage.inUse) {
      return NextResponse.json({
        success: false,
        error: 'This image is in use and cannot be deleted.',
        usage,
      }, { status: 409 })
    }

    await cloudinary.uploader.destroy(item.publicId)
    await Media.findByIdAndDelete(id)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
