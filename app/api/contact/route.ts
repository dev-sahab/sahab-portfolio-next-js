import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Contact from '@/models/Contact'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { name, email, message } = body
    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Name, email and message are required' }, { status: 400 })
    }
    const contact = await Contact.create(body)

    // Send email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: process.env.RESEND_FROM || 'noreply@example.com',
          to: process.env.RESEND_TO || 'frshahab.me@gmail.com',
          subject: `New Contact: ${name} — ${body.subject || 'Portfolio'}`,
          html: `<h2>New contact from ${name}</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${body.subject || 'N/A'}</p>
            <p><strong>Budget:</strong> ${body.budget || 'N/A'}</p>
            <p><strong>Message:</strong></p><p>${message}</p>`,
        })
      } catch (emailErr) {
        console.error('Email send failed:', emailErr)
      }
    }

    return NextResponse.json({ success: true, data: contact }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  try {
    await connectDB()
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json({ success: true, data: contacts })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
