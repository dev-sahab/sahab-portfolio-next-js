import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import { getAllReferencedUrls, type MediaReference } from '@/lib/mediaUsage'

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const { ids } = await req.json()
    if (!Array.isArray(ids) || !ids.length) {
      return NextResponse.json({ success: false, error: 'No ids provided' }, { status: 400 })
    }

    await connectDB()
    const items = await Media.find({ _id: { $in: ids } })
    const usageMap = await getAllReferencedUrls()

    const deleted: string[] = []
    const skipped: { id: string; filename: string; references: MediaReference[] }[] = []

    for (const item of items) {
      const references = usageMap.get(item.url) || []
      if (references.length > 0) {
        skipped.push({ id: item._id.toString(), filename: item.filename, references })
        continue
      }
      await cloudinary.uploader.destroy(item.publicId).catch(() => {})
      await Media.findByIdAndDelete(item._id)
      deleted.push(item._id.toString())
    }

    return NextResponse.json({ success: true, deleted, skipped })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
