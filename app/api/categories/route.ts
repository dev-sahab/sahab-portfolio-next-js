import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import { slugify } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const query = type ? { type } : {}
    const categories = await Category.find(query).sort({ name: 1 }).lean()
    return NextResponse.json({ success: true, data: categories })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  try {
    await connectDB()
    const body = await req.json()
    if (!body.slug) body.slug = slugify(body.name)
    if (!body.parent) body.parent = null
    const category = await Category.create(body)
    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
