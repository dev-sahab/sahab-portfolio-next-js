import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import QuoteRequest from '@/models/QuoteRequest'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    if (!body.name || !body.email || !body.service) {
      return NextResponse.json({ success: false, error: 'Name, email and service are required' }, { status: 400 })
    }
    const quote = await QuoteRequest.create(body)

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: process.env.RESEND_FROM || 'noreply@example.com',
          to: process.env.RESEND_TO || 'frshahab.me@gmail.com',
          subject: `New Quote Request: ${body.name} — ${body.service}`,
          html: `<h2>New quote request from ${body.name}</h2>
            <p><strong>Email:</strong> ${body.email}</p>
            <p><strong>Service:</strong> ${body.service}</p>
            <p><strong>Platform:</strong> ${body.platform || 'N/A'}</p>
            <p><strong>Timeline:</strong> ${body.estimatedTimeline || 'N/A'}</p>
            <p><strong>Notes:</strong> ${body.notes || 'N/A'}</p>`,
        })
      } catch (emailErr) {
        console.error('Email send failed:', emailErr)
      }
    }

    return NextResponse.json({ success: true, data: quote }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  try {
    await connectDB()
    const quotes = await QuoteRequest.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json({ success: true, data: quotes })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
