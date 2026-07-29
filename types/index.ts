export interface Category {
  _id: string
  name: string
  slug: string
  type: 'project' | 'blog'
  parent?: string | null
  description?: string
}

export interface Tag {
  _id: string
  name: string
  slug: string
  type: 'project' | 'blog'
}

export interface Project {
  _id?: string
  title: string
  slug: string
  category: Category | null
  excerpt: string
  content: string
  coverImage?: string
  images?: string[]
  tags: Tag[]
  liveUrl?: string
  githubUrl?: string
  featured: boolean
  published: boolean
  year: number
  client?: string
  duration?: string
  stack: string[]
  createdAt?: string
  updatedAt?: string
}

export interface BlogPost {
  _id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string
  category: Category | null
  tags: Tag[]
  published: boolean
  featured: boolean
  readTime?: number
  createdAt?: string
  updatedAt?: string
}

export interface Testimonial {
  _id?: string
  name: string
  role: string
  company?: string
  avatar?: string
  content: string
  rating: number
  featured: boolean
  order: number
  createdAt?: string
}

export interface Service {
  icon: string
  title: string
  description: string
  tags: string[]
  order: number
}

export interface SkillGroup {
  name: string
  skills: { name: string; level: number }[]
}

export interface Stat {
  value: string
  label: string
  target?: number
  suffix?: string
}

export interface SiteSettings {
  _id?: string
  name: string
  tagline: string
  bio: string
  email: string
  phone?: string
  location: string
  company?: string
  availability: boolean
  availabilityText?: string
  social: {
    github?: string
    linkedin?: string
    twitter?: string
    upwork?: string
  }
  services: Service[]
  skills: SkillGroup[]
  stats: Stat[]
  updatedAt?: string
}

export interface ContactSubmission {
  _id?: string
  name: string
  email: string
  subject?: string
  budget?: string
  message: string
  read: boolean
  createdAt?: string
}

export interface QuoteRequest {
  _id?: string
  name: string
  email: string
  url?: string
  service: string
  uiux?: string
  platform?: string
  pages?: number
  websiteType?: string
  timeline?: string
  features?: string[]
  notes?: string
  estimatedTimeline?: string
  read: boolean
  createdAt?: string
}

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}
