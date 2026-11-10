import type { HeadingText, Stat, Testimonial } from './types'

export const reviewsSection = {
  eyebrow: '04 — Reviews',
  title: 'Clients *come back.*' satisfies HeadingText,
}

export const stats: Stat[] = [
  { value: '300', suffix: '+', label: 'projects delivered' },
  { value: '170', suffix: '+', label: 'happy clients' },
  { value: '5.0', label: 'average across 200+ reviews' },
  { value: '5', suffix: '+ yrs', label: 'building websites' },
]

export const featuredTestimonial: Testimonial = {
  quote: 'I continue to work with Shahab because of his dedication to quality.',
  name: 'Pablo',
  role: 'Owner, Pakkabags',
}

export const testimonials: Testimonial[] = [
  {
    quote: 'An experienced, skilled, knowledgeable and highly competent developer.',
    name: 'Jaspe',
    role: 'Client on Fiverr',
  },
  {
    quote: 'He was awesome to work with: honest, professional and reliable from start to finish.',
    name: 'dewaynemichaelt',
    role: 'Client on Fiverr',
  },
  { quote: 'Excellent experience from start to finish.', name: 'adamjgould', role: 'Client on Fiverr' },
]
