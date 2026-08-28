import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Contact from '@/models/Contact'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { apiError } from '@/lib/apiError'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { escapeHtml } from '@/lib/utils'

export async function POST(req: NextRequest) {
  // 5 submissions / 10 minutes / IP — stops the form being used to spam the
  // inbox or run up the Resend send count.
  const ip = getClientIp(req)
  const { allowed, retryAfterSeconds } = rateLimit(`contact:${ip}`, 5, 10 * 60_000)
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many submissions. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    )
  }

  try {
    await connectDB()
    const body = await req.json()
    const { name, email, message, subject, budget } = body
    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Name, email and message are required' }, { status: 400 })
    }
    // Explicit field whitelist, not `Contact.create(body)` — this is a
    // public, unauthenticated endpoint, so an anonymous submitter must not
    // be able to set `read` (or anything else outside these fields) on
    // their own submission.
    const contact = await Contact.create({ name, email, message, subject, budget })

    // Send email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: process.env.RESEND_FROM || 'noreply@example.com',
          to: process.env.RESEND_TO || 'frshahab.me@gmail.com',
          subject: `New Contact: ${name} — ${body.subject || 'Portfolio'}`,
          html: `<h2>New contact from ${escapeHtml(name)}</h2>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Subject:</strong> ${escapeHtml(body.subject || 'N/A')}</p>
            <p><strong>Budget:</strong> ${escapeHtml(body.budget || 'N/A')}</p>
            <p><strong>Message:</strong></p><p>${escapeHtml(message)}</p>`,
        })
      } catch (emailErr) {
        console.error('Email send failed:', emailErr)
      }
    }

    return NextResponse.json({ success: true, data: contact }, { status: 201 })
  } catch (e: any) {
    return apiError(e, 'contact')
  }
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (!can(role, 'contacts.read')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json({ success: true, data: contacts })
  } catch (e: any) {
    return apiError(e, 'contact')
  }
}
