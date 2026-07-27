import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const project = await Project.findById(id).lean()
    if (!project) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: project })
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
    const project = await Project.findByIdAndUpdate(id, body, { new: true, runValidators: true })
    if (!project) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: project })
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
    await Project.findByIdAndDelete(id)
    return NextResponse.json({ success: true, message: 'Deleted' })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
