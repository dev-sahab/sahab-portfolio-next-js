import connectDB from '@/lib/mongodb'
import Testimonial from '@/models/Testimonial'
import TestimonialsClient from '@/components/dashboard/TestimonialsClient'
import type { Testimonial as ITestimonial } from '@/types'

export default async function TestimonialsPage() {
  await connectDB()
  const items = JSON.parse(JSON.stringify(
    await Testimonial.find().sort({ order: 1 }).lean()
  )) as ITestimonial[]

  return <TestimonialsClient initialItems={items} />
}
