import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import QuoteRequest from '@/models/QuoteRequest'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { apiError } from '@/lib/apiError'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { escapeHtml } from '@/lib/utils'

export async function POST(req: NextRequest) {
  // 5 submissions / 10 minutes / IP — same abuse guard as /api/contact.
  const ip = getClientIp(req)
  const { allowed, retryAfterSeconds } = rateLimit(`quote:${ip}`, 5, 10 * 60_000)
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many submissions. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    )
  }

  try {
    await connectDB()
    const body = await req.json()
    if (!body.name || !body.email || !body.service) {
      return NextResponse.json({ success: false, error: 'Name, email and service are required' }, { status: 400 })
    }
    // Explicit field whitelist — same reasoning as /api/contact: this is
    // public and unauthenticated, so `read` must not be settable by the
    // submitter themselves.
    const { name, email, url, service, uiux, platform, pages, websiteType, timeline, features, notes, estimatedTimeline } = body
    const quote = await QuoteRequest.create({
      name, email, url, service, uiux, platform, pages, websiteType, timeline, features, notes, estimatedTimeline,
    })

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: process.env.RESEND_FROM || 'noreply@example.com',
          to: process.env.RESEND_TO || 'frshahab.me@gmail.com',
          subject: `New Quote Request: ${body.name} — ${body.service}`,
          html: `<h2>New quote request from ${escapeHtml(body.name)}</h2>
            <p><strong>Email:</strong> ${escapeHtml(body.email)}</p>
            <p><strong>Service:</strong> ${escapeHtml(body.service)}</p>
            <p><strong>Platform:</strong> ${escapeHtml(body.platform || 'N/A')}</p>
            <p><strong>Timeline:</strong> ${escapeHtml(body.estimatedTimeline || 'N/A')}</p>
            <p><strong>Notes:</strong> ${escapeHtml(body.notes || 'N/A')}</p>`,
        })
      } catch (emailErr) {
        console.error('Email send failed:', emailErr)
      }
    }

    return NextResponse.json({ success: true, data: quote }, { status: 201 })
  } catch (e: any) {
    return apiError(e, 'quote')
  }
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (!can(role, 'quotes.read')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const quotes = await QuoteRequest.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json({ success: true, data: quotes })
  } catch (e: any) {
    return apiError(e, 'quote')
  }
}
